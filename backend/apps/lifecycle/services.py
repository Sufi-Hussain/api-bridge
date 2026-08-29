from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError
from apps.ess.models import Employment, EmploymentStatus
from audit.services import log_event
from .models import LifecycleRecord, LifecycleChecklistItem

TRANSITIONS = {
    LifecycleRecord.Status.PREBOARDING: {LifecycleRecord.Status.ONBOARDING},
    LifecycleRecord.Status.ONBOARDING: {LifecycleRecord.Status.ACTIVE},
    LifecycleRecord.Status.ACTIVE: {LifecycleRecord.Status.OFFBOARDING},
    LifecycleRecord.Status.OFFBOARDING: {LifecycleRecord.Status.SEPARATED},
    LifecycleRecord.Status.SEPARATED: set(),
}

ONBOARDING_CHECKLIST = ["Confirm joining date and role", "Collect identity documents", "Complete HR verification", "Allocate equipment", "Configure benefits and payroll"]
OFFBOARDING_CHECKLIST = ["Manager knowledge transfer", "Return allocated assets", "Complete leave and payroll clearance", "Revoke application access", "Complete exit approval"]

@transaction.atomic
def advance(record, target, actor, **fields):
    if target not in TRANSITIONS.get(record.status, set()):
        raise ValidationError({"status": f"Invalid lifecycle transition from {record.status} to {target}."})
    for key, value in fields.items():
        if hasattr(record, key): setattr(record, key, value)
    record.status = target
    if target == LifecycleRecord.Status.ACTIVE:
        record.hr_verified_at = timezone.now()
        Employment.objects.filter(employee=record.employee).update(status=EmploymentStatus.ACTIVE)
    if target == LifecycleRecord.Status.SEPARATED:
        record.access_revoked_at = timezone.now()
        record.completed_at = timezone.now()
        Employment.objects.filter(employee=record.employee).update(status=EmploymentStatus.EXITED, exit_date=record.last_working_day)
    record.save()
    log_event(actor=actor, action=f"lifecycle.{target}", target=record, organization=record.organization, metadata={"status": target})
    return record

@transaction.atomic
def create_record(*, organization, employee, actor, **fields):
    record, created = LifecycleRecord.objects.get_or_create(organization=organization, employee=employee, defaults=fields)
    if created:
        LifecycleChecklistItem.objects.bulk_create([LifecycleChecklistItem(lifecycle=record, phase="onboarding", title=t) for t in ONBOARDING_CHECKLIST] + [LifecycleChecklistItem(lifecycle=record, phase="offboarding", title=t) for t in OFFBOARDING_CHECKLIST])
        log_event(actor=actor, action="lifecycle.created", target=record, organization=organization)
    return record
