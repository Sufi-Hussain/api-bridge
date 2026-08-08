import uuid

from rest_framework import serializers, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .context import build_context
from .gateway import AIGateway
from .models import AIConversation, AIMessage


class ChatSerializer(serializers.Serializer):
    conversation_id = serializers.UUIDField(required=False)
    message = serializers.CharField(max_length=4000, trim_whitespace=True)


class ConversationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        context = build_context(request)
        rows = AIConversation.objects.filter(organization=context.organization, user=request.user)
        return Response([{"id": str(row.id), "title": row.title, "updatedAt": row.updated_at} for row in rows[:50]])


class ChatView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChatSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        context = build_context(request)
        conversation_id = serializer.validated_data.get("conversation_id")
        conversation = None
        if conversation_id:
            conversation = AIConversation.objects.filter(id=conversation_id, organization=context.organization, user=request.user).first()
            if conversation is None:
                return Response({"detail": "Conversation not found."}, status=status.HTTP_404_NOT_FOUND)
        conversation = conversation or AIConversation.objects.create(organization=context.organization, user=request.user)
        question = serializer.validated_data["message"]
        AIMessage.objects.create(conversation=conversation, role=AIMessage.Role.USER, content=question)
        history = list(conversation.messages.values("role", "content"))
        try:
            answer = AIGateway().answer(context, history, question)
        except PermissionError as exc:
            return Response({"code": "forbidden", "detail": str(exc)}, status=status.HTTP_403_FORBIDDEN)
        except Exception:
            return Response({"code": "ai_unavailable", "detail": "The AI assistant is temporarily unavailable."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        AIMessage.objects.create(conversation=conversation, role=AIMessage.Role.ASSISTANT, content=answer)
        return Response({"conversationId": str(conversation.id), "message": {"role": "assistant", "content": answer, "citations": []}})
