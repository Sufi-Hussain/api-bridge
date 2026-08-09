import uuid

from rest_framework import serializers, status
from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from audit.services import log_event

from .context import build_context
from .gateway import AIGateway
from .models import AIConversation, AIMessage, AIToolExecution


class CanUseAI(BasePermission):
    message = "You do not have permission to use the AI assistant."

    def has_permission(self, request, view):
        try:
            return build_context(request).allows("ai.chat")
        except PermissionError:
            return False


class ChatSerializer(serializers.Serializer):
    conversation_id = serializers.UUIDField(required=False)
    message = serializers.CharField(max_length=4000, trim_whitespace=True)


class ConversationListView(APIView):
    permission_classes = [IsAuthenticated, CanUseAI]

    def get(self, request):
        context = build_context(request)
        rows = AIConversation.objects.filter(organization=context.organization, user=request.user)
        return Response([{"id": str(row.id), "title": row.title, "updatedAt": row.updated_at} for row in rows[:50]])


class ChatView(APIView):
    permission_classes = [IsAuthenticated]
    # permission_classes = [IsAuthenticated, CanUseAI]
    

    def post(self, request):
        # print("USER:", request.user)
        # print("AUTH:", request.auth)
        print("AUTHENTICATED:", request.user.is_authenticated)
        print(f"ChatView POST request data: {request.data}")
        serializer = ChatSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # print(f"ChatView POST serializer validated data: {serializer.validated_data}")
        context = build_context(request)
        conversation_id = serializer.validated_data.get("conversation_id")
        conversation = None
        if conversation_id:
            conversation = AIConversation.objects.filter(id=conversation_id, organization=context.organization, user=request.user).first()
            if conversation is None:
                return Response({"detail": "Conversation not found."}, status=status.HTTP_404_NOT_FOUND)
        conversation = conversation or AIConversation.objects.create(organization=context.organization, user=request.user)
        # print(f"ChatView POST conversation: {conversation}")
        question = serializer.validated_data["message"]
        # print(f"ChatView POST question: {question}")
        AIMessage.objects.create(conversation=conversation, role=AIMessage.Role.USER, content=question)
        history = list(conversation.messages.values("role", "content"))
        if history:
            history.pop()
        try:
            answer, tool_events = AIGateway().answer(context, history, question)
        except PermissionError as exc:
            log_event(actor=request.user, action="ai.chat.denied", organization=context.organization, metadata={"request_id": context.request_id})
            print(f"PermissionError: {exc}")
            return Response({"code": "forbidden", "detail": str(exc)}, status=status.HTTP_403_FORBIDDEN)
        except Exception as exc:
            code = getattr(exc, "code", "ai_unavailable")
            detail = getattr(exc, "message", "The AI assistant is temporarily unavailable.")
            log_event(actor=request.user, action="ai.chat.failed", organization=context.organization, metadata={"request_id": context.request_id, "error_code": code})
            print(f"Exception: {exc}, code: {code}, detail: {detail}")
            return Response({"code": code, "detail": detail}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        for event in tool_events:
            AIToolExecution.objects.create(conversation=conversation, name=event["name"], status=event["status"])
        AIMessage.objects.create(conversation=conversation, role=AIMessage.Role.ASSISTANT, content=answer, metadata={"tools": tool_events})
        log_event(actor=request.user, action="ai.chat.completed", organization=context.organization, metadata={"request_id": context.request_id})
        return Response({"conversationId": str(conversation.id), "message": {"role": "assistant", "content": answer, "citations": []}})
