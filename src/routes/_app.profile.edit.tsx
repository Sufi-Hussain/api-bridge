import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    ArrowLeft,
    CalendarDays,
    Check,
    ChevronDown,
    Info,
    Mail,
    MapPin,
    Pencil,
    Plus,
    Save,
    Trash2,
    UserRound,
    X,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth/context";

import { PageHeader } from "@/components/common/page-header";
import { SectionCard } from "@/components/common/section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

import {
    Command,
    CommandEmpty,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";

import { Calendar } from "@/components/ui/calendar";

import { essService, type EmployeeProfile } from "@/services/ess";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type EmployeeSkill = {
    id: string;
    name: string;
    level: number;
    endorsed: number;
};

type SkillCatalogItem = {
    id: string;
    name: string;
};

type SkillDialogMode = "add" | "edit";

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const NATIONALITIES = [
    "Afghan",
    "Albanian",
    "Algerian",
    "American",
    "Argentine",
    "Australian",
    "Austrian",
    "Bangladeshi",
    "Belgian",
    "Brazilian",
    "British",
    "Bulgarian",
    "Canadian",
    "Chilean",
    "Chinese",
    "Colombian",
    "Croatian",
    "Czech",
    "Danish",
    "Dutch",
    "Egyptian",
    "Emirati",
    "Finnish",
    "French",
    "German",
    "Greek",
    "Hungarian",
    "Indian",
    "Indonesian",
    "Irish",
    "Israeli",
    "Italian",
    "Japanese",
    "Kenyan",
    "Malaysian",
    "Mexican",
    "Nepalese",
    "New Zealander",
    "Nigerian",
    "Norwegian",
    "Pakistani",
    "Peruvian",
    "Philippine",
    "Polish",
    "Portuguese",
    "Romanian",
    "Russian",
    "Saudi Arabian",
    "Singaporean",
    "South African",
    "South Korean",
    "Spanish",
    "Sri Lankan",
    "Swedish",
    "Swiss",
    "Thai",
    "Turkish",
    "Ukrainian",
    "Vietnamese",
];

const BLOOD_GROUPS = [
    "A+",
    "A-",
    "B+",
    "B-",
    "AB+",
    "AB-",
    "O+",
    "O-",
];

const schema = z.object({
    firstName: z.string().trim().min(1, "First name is required"),

    lastName: z.string().trim().min(1, "Last name is required"),

    preferredName: z.string().trim().optional(),

    gender: z.enum([
        "male",
        "female",
        "non-binary",
        "prefer-not-to-say",
    ]),

    dob: z.string().min(1, "Date of birth is required"),

    maritalStatus: z.enum([
        "single",
        "married",
        "divorced",
        "widowed",
    ]),

    nationality: z.string().trim().min(1, "Nationality is required"),

    nationalityOther: z.string().trim().optional(),

    bloodGroup: z.string().trim().min(1, "Blood group is required"),

    personalEmail: z
        .string()
        .trim()
        .email("Enter a valid email address"),

    mobile: z.string().trim().min(1, "Mobile number is required"),

    workPhone: z.string().trim().optional(),

    address: z.object({
        line1: z.string().trim().min(1, "Address is required"),

        line2: z.string().trim().optional(),

        city: z.string().trim().min(1, "City is required"),

        state: z.string().trim().min(1, "State is required"),

        country: z.string().trim().min(1, "Country is required"),

        postal: z.string().trim().min(1, "Postal code is required"),
    }),
});

type FormValues = z.infer<typeof schema>;

/* -------------------------------------------------------------------------- */
/* Route                                                                      */
/* -------------------------------------------------------------------------- */

export const Route = createFileRoute("/_app/profile/edit")({
    head: () => ({
        meta: [
            {
                title: "Edit Profile · Meridian HR",
            },
            {
                name: "description",
                content: "Edit your personal profile information.",
            },
        ],
    }),

    component: EditProfilePage,
});

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

function EditProfilePage() {
    const navigate = useNavigate();
    const { refresh } = useAuth();

    const [profile, setProfile] = useState<EmployeeProfile | null>(null);

    const [skills, setSkills] = useState<EmployeeSkill[]>([]);
    const [skillCatalog, setSkillCatalog] = useState<SkillCatalogItem[]>([]);

    const [skillsLoading, setSkillsLoading] = useState(true);
    const [skillsError, setSkillsError] = useState(false);

    const [skillDialogOpen, setSkillDialogOpen] = useState(false);
    const [skillDialogMode, setSkillDialogMode] =
        useState<SkillDialogMode>("add");

    const [selectedSkillId, setSelectedSkillId] = useState("");
    const [selectedSkillLevel, setSelectedSkillLevel] = useState(1);
    const [editingSkillId, setEditingSkillId] = useState<string | null>(null);

    const [skillSelectOpen, setSkillSelectOpen] = useState(false);

    const [skillSaving, setSkillSaving] = useState(false);
    const [skillDeletingId, setSkillDeletingId] = useState<string | null>(null);

    const [nationalityOpen, setNationalityOpen] = useState(false);
    const [dobOpen, setDobOpen] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),

        defaultValues: {
            firstName: "",
            lastName: "",
            preferredName: "",

            gender: "prefer-not-to-say",

            dob: "",

            maritalStatus: "single",

            nationality: "",
            nationalityOther: "",

            bloodGroup: "",

            personalEmail: "",
            mobile: "",
            workPhone: "",

            address: {
                line1: "",
                line2: "",
                city: "",
                state: "",
                country: "",
                postal: "",
            },
        },
    });

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        watch,
        formState: {
            errors,
            isSubmitting,
        },
    } = form;

    const nationality = watch("nationality");
    const dob = watch("dob");

    /* ------------------------------------------------------------------------ */
    /* Load profile                                                             */
    /* ------------------------------------------------------------------------ */

    useEffect(() => {
        let mounted = true;

        async function loadProfile() {
            try {
                const data = await essService.getProfile();

                if (!mounted) return;

                setProfile(data);

                reset({
                    firstName: data.firstName ?? "",
                    lastName: data.lastName ?? "",
                    preferredName: data.preferredName ?? "",

                    gender: data.gender ?? "prefer-not-to-say",

                    dob: data.dob ?? "",

                    maritalStatus: data.maritalStatus ?? "single",

                    nationality: data.nationality ?? "",
                    nationalityOther: "",

                    bloodGroup: data.bloodGroup ?? "",

                    personalEmail: data.personalEmail ?? "",
                    mobile: data.mobile ?? "",
                    workPhone: data.workPhone ?? "",

                    address: {
                        line1: data.address?.line1 ?? "",
                        line2: data.address?.line2 ?? "",
                        city: data.address?.city ?? "",
                        state: data.address?.state ?? "",
                        country: data.address?.country ?? "",
                        postal: data.address?.postal ?? "",
                    },
                });
            } catch (error) {
                console.error("Failed to load profile:", error);

                toast.error("Failed to load profile", {
                    description:
                        "We could not load your profile information. Please try again.",
                });
            }
        }

        loadProfile();

        return () => {
            mounted = false;
        };
    }, [reset]);

    /* ------------------------------------------------------------------------ */
    /* Load skills                                                              */
    /* ------------------------------------------------------------------------ */

    useEffect(() => {
        let mounted = true;

        async function loadSkills() {
            try {
                setSkillsLoading(true);
                setSkillsError(false);

                const [currentSkills, catalogue] = await Promise.all([
                    essService.skills.list(),
                    essService.getSkillCatalog(),
                ]);

                if (!mounted) return;

                setSkills(currentSkills as EmployeeSkill[]);
                setSkillCatalog(catalogue as SkillCatalogItem[]);
            } catch (error) {
                console.error("Failed to load skills:", error);

                if (!mounted) return;

                setSkillsError(true);
                toast.error("Failed to load skills", {
                    description:
                        "We could not load your skills. Please refresh and try again.",
                });
            } finally {
                if (mounted) {
                    setSkillsLoading(false);
                }
            }
        }

        loadSkills();

        return () => {
            mounted = false;
        };
    }, []);

    /* ------------------------------------------------------------------------ */
    /* Profile save                                                             */
    /* ------------------------------------------------------------------------ */

    const onSubmit = async (data: FormValues) => {
        try {
            const nationalityValue =
                data.nationality === "__other__"
                    ? data.nationalityOther?.trim() ?? ""
                    : data.nationality;

            if (!nationalityValue) {
                toast.error("Nationality is required");
                return;
            }

            const payload: Partial<FormValues> = {
                ...data,
                nationality: nationalityValue,
            };

            delete payload.nationalityOther;

            await essService.updateProfile(payload);

            /*
             * Important:
             * Refresh the authenticated user so the updated name is reflected
             * everywhere in the application, including the dashboard/header.
             */
            await refresh();

            toast.success("Profile updated", {
                description:
                    "Your profile information has been updated successfully.",
            });

            navigate({
                to: "/profile/personal",
            });
        } catch (error) {
            console.error("Failed to update profile:", error);

            toast.error("Failed to update profile", {
                description:
                    "Something went wrong while saving your profile. Please try again.",
            });
        }
    };

    /* ------------------------------------------------------------------------ */
    /* Skill helpers                                                            */
    /* ------------------------------------------------------------------------ */

    const availableSkills = useMemo(() => {
        const selectedIds = new Set(
            skills
                .map((skill) => {
                    const catalogMatch = skillCatalog.find(
                        (catalogSkill) => catalogSkill.name === skill.name,
                    );

                    return catalogMatch?.id;
                })
                .filter(Boolean),
        );

        return skillCatalog.filter((skill) => !selectedIds.has(skill.id));
    }, [skillCatalog, skills]);

    const openAddSkill = () => {
        setSkillDialogMode("add");
        setEditingSkillId(null);
        setSelectedSkillId("");
        setSelectedSkillLevel(1);
        setSkillDialogOpen(true);
    };

    const openEditSkill = (skill: EmployeeSkill) => {
        const catalogueMatch = skillCatalog.find(
            (catalogSkill) => catalogSkill.name === skill.name,
        );

        setSkillDialogMode("edit");
        setEditingSkillId(skill.id);
        setSelectedSkillId(catalogueMatch?.id ?? "");
        setSelectedSkillLevel(skill.level);
        setSkillDialogOpen(true);
    };

    const closeSkillDialog = () => {
        if (skillSaving) return;

        setSkillDialogOpen(false);
        setEditingSkillId(null);
        setSelectedSkillId("");
        setSelectedSkillLevel(1);
    };

    const saveSkill = async () => {
        if (skillDialogMode === "add" && !selectedSkillId) {
            toast.error("Select a skill", {
                description: "Choose a skill before adding it.",
            });
            return;
        }

        if (
            skillDialogMode === "edit" &&
            !editingSkillId
        ) {
            return;
        }

        try {
            setSkillSaving(true);

            if (skillDialogMode === "add") {
                const created = await essService.skills.create({
                    skillId: selectedSkillId,
                    level: selectedSkillLevel,
                });

                setSkills((current) => [
                    ...current,
                    created as EmployeeSkill,
                ]);

                toast.success("Skill added", {
                    description: "The skill has been added to your profile.",
                });
            } else if (editingSkillId) {
                const updated = await essService.skills.update(
                    editingSkillId,
                    {
                        level: selectedSkillLevel,
                    },
                );

                setSkills((current) =>
                    current.map((skill) =>
                        skill.id === editingSkillId
                            ? {
                                ...skill,
                                ...(updated as EmployeeSkill),
                                level: selectedSkillLevel,
                            }
                            : skill,
                    ),
                );

                toast.success("Skill updated", {
                    description: "Your skill level has been updated.",
                });
            }

            closeSkillDialog();
        } catch (error) {
            console.error("Failed to save skill:", error);

            toast.error("Failed to save skill", {
                description:
                    "Something went wrong while saving the skill. Please try again.",
            });
        } finally {
            setSkillSaving(false);
        }
    };

    const deleteSkill = async (skill: EmployeeSkill) => {
        try {
            setSkillDeletingId(skill.id);

            await essService.skills.remove(skill.id);

            setSkills((current) =>
                current.filter((item) => item.id !== skill.id),
            );

            toast.success("Skill removed", {
                description: `${skill.name} has been removed from your profile.`,
            });
        } catch (error) {
            console.error("Failed to delete skill:", error);

            toast.error("Failed to remove skill", {
                description:
                    "Something went wrong while removing the skill.",
            });
        } finally {
            setSkillDeletingId(null);
        }
    };

    /* ------------------------------------------------------------------------ */
    /* Date helpers                                                             */
    /* ------------------------------------------------------------------------ */

    const selectedDob = dob
        ? new Date(`${dob}T00:00:00`)
        : undefined;

    const handleDobChange = (date: Date | undefined) => {
        if (!date) {
            setValue("dob", "", {
                shouldValidate: true,
            });
            return;
        }

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        setValue(
            "dob",
            `${year}-${month}-${day}`,
            {
                shouldValidate: true,
            },
        );

        setDobOpen(false);
    };

    const formattedDob = selectedDob
        ? selectedDob.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        })
        : "Select date";

    /* ------------------------------------------------------------------------ */
    /* Loading                                                                  */
    /* ------------------------------------------------------------------------ */

    if (!profile) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title="Edit Profile"
                    description="Update your personal and contact information."
                    breadcrumbs={[
                        { label: "Me" },
                        { label: "Profile" },
                        { label: "Edit" },
                    ]}
                />

                <SectionCard title="Personal information">
                    <div className="flex items-center gap-3 py-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <UserRound className="h-4 w-4" />
                        </div>

                        <div>
                            <p className="text-sm font-medium">
                                Loading your profile
                            </p>

                            <p className="text-xs text-muted-foreground">
                                Please wait while we load your information...
                            </p>
                        </div>
                    </div>
                </SectionCard>
            </div>
        );
    }

    /* ------------------------------------------------------------------------ */
    /* Render                                                                   */
    /* ------------------------------------------------------------------------ */

    return (
        <div className="space-y-6">
            <PageHeader
                title="Edit Profile"
                description="Keep your employee information accurate and up to date."
                breadcrumbs={[
                    { label: "Me" },
                    { label: "Profile" },
                    { label: "Edit" },
                ]}
                actions={
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            navigate({
                                to: "/profile/personal",
                            })
                        }
                    >
                        <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                        Back to profile
                    </Button>
                }
            />

            {/* Intro */}
            <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/30 px-4 py-3.5">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Info className="h-4 w-4" />
                </div>

                <div>
                    <p className="text-sm font-medium">
                        Keep your profile information current
                    </p>

                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                        Update your personal details, contact information and
                        professional skills. Changes are reflected across the
                        employee portal.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="personal" className="w-full">
                <TabsList className="w-full justify-start overflow-x-auto md:w-fit">
                    <TabsTrigger value="personal">
                        Personal
                    </TabsTrigger>

                    <TabsTrigger value="contact">
                        Contact & Address
                    </TabsTrigger>

                    <TabsTrigger value="skills">
                        Skills
                    </TabsTrigger>
                </TabsList>

                {/* ================================================================== */}
                {/* PERSONAL                                                           */}
                {/* ================================================================== */}

                <TabsContent value="personal">
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-6"
                    >
                        <SectionCard title="Personal information">
                            <div className="mb-5 flex items-start gap-3 rounded-lg border border-border/50 bg-muted/20 p-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <UserRound className="h-4 w-4" />
                                </div>

                                <div>
                                    <p className="text-sm font-medium">
                                        Basic personal details
                                    </p>

                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        Update your name, identity and personal
                                        information.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                {/* First name */}
                                <div>
                                    <Label className="text-xs uppercase tracking-wide">
                                        First name
                                    </Label>

                                    <Input
                                        {...register("firstName")}
                                        className="mt-1.5"
                                    />

                                    {errors.firstName && (
                                        <p className="mt-1 text-xs text-destructive">
                                            {errors.firstName.message}
                                        </p>
                                    )}
                                </div>

                                {/* Last name */}
                                <div>
                                    <Label className="text-xs uppercase tracking-wide">
                                        Last name
                                    </Label>

                                    <Input
                                        {...register("lastName")}
                                        className="mt-1.5"
                                    />

                                    {errors.lastName && (
                                        <p className="mt-1 text-xs text-destructive">
                                            {errors.lastName.message}
                                        </p>
                                    )}
                                </div>

                                {/* Preferred name */}
                                <div>
                                    <Label className="text-xs uppercase tracking-wide">
                                        Preferred name
                                    </Label>

                                    <Input
                                        {...register("preferredName")}
                                        className="mt-1.5"
                                        placeholder="How should we address you?"
                                    />
                                </div>

                                {/* Date of birth */}
                                <div>
                                    <Label className="text-xs uppercase tracking-wide">
                                        Date of birth
                                    </Label>

                                    <Popover
                                        open={dobOpen}
                                        onOpenChange={setDobOpen}
                                    >
                                        <PopoverTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="mt-1.5 w-full justify-start font-normal"
                                            >
                                                <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />

                                                <span
                                                    className={
                                                        selectedDob
                                                            ? ""
                                                            : "text-muted-foreground"
                                                    }
                                                >
                                                    {formattedDob}
                                                </span>
                                            </Button>
                                        </PopoverTrigger>

                                        <PopoverContent
                                            className="w-auto p-0"
                                            align="start"
                                        >
                                            <Calendar
                                                mode="single"
                                                selected={selectedDob}
                                                onSelect={handleDobChange}
                                                captionLayout="dropdown"
                                                disabled={(date) =>
                                                    date > new Date()
                                                }
                                            />
                                        </PopoverContent>
                                    </Popover>

                                    {errors.dob && (
                                        <p className="mt-1 text-xs text-destructive">
                                            {errors.dob.message}
                                        </p>
                                    )}
                                </div>

                                {/* Gender */}
                                <div>
                                    <Label className="text-xs uppercase tracking-wide">
                                        Gender
                                    </Label>

                                    <Select
                                        value={watch("gender")}
                                        onValueChange={(value) =>
                                            setValue(
                                                "gender",
                                                value as FormValues["gender"],
                                                {
                                                    shouldValidate: true,
                                                },
                                            )
                                        }
                                    >
                                        <SelectTrigger className="mt-1.5">
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>

                                        <SelectContent>
                                            <SelectItem value="male">
                                                Male
                                            </SelectItem>

                                            <SelectItem value="female">
                                                Female
                                            </SelectItem>

                                            <SelectItem value="non-binary">
                                                Non-binary
                                            </SelectItem>

                                            <SelectItem value="prefer-not-to-say">
                                                Prefer not to say
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {errors.gender && (
                                        <p className="mt-1 text-xs text-destructive">
                                            {errors.gender.message}
                                        </p>
                                    )}
                                </div>

                                {/* Marital status */}
                                <div>
                                    <Label className="text-xs uppercase tracking-wide">
                                        Marital status
                                    </Label>

                                    <Select
                                        value={watch("maritalStatus")}
                                        onValueChange={(value) =>
                                            setValue(
                                                "maritalStatus",
                                                value as FormValues["maritalStatus"],
                                                {
                                                    shouldValidate: true,
                                                },
                                            )
                                        }
                                    >
                                        <SelectTrigger className="mt-1.5">
                                            <SelectValue placeholder="Select marital status" />
                                        </SelectTrigger>

                                        <SelectContent>
                                            <SelectItem value="single">
                                                Single
                                            </SelectItem>

                                            <SelectItem value="married">
                                                Married
                                            </SelectItem>

                                            <SelectItem value="divorced">
                                                Divorced
                                            </SelectItem>

                                            <SelectItem value="widowed">
                                                Widowed
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {errors.maritalStatus && (
                                        <p className="mt-1 text-xs text-destructive">
                                            {errors.maritalStatus.message}
                                        </p>
                                    )}
                                </div>

                                {/* Nationality */}
                                <div>
                                    <Label className="text-xs uppercase tracking-wide">
                                        Nationality
                                    </Label>

                                    <Popover
                                        open={nationalityOpen}
                                        onOpenChange={setNationalityOpen}
                                    >
                                        <PopoverTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="mt-1.5 w-full justify-between font-normal"
                                            >
                                                <span
                                                    className={
                                                        nationality
                                                            ? ""
                                                            : "text-muted-foreground"
                                                    }
                                                >
                                                    {nationality === "__other__"
                                                        ? "Other"
                                                        : nationality || "Select nationality"}
                                                </span>

                                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                        </PopoverTrigger>

                                        <PopoverContent
                                            className="w-[var(--radix-popover-trigger-width)] p-0"
                                            align="start"
                                        >
                                            <Command>
                                                <CommandInput placeholder="Search nationality..." />

                                                <CommandList>
                                                    <CommandEmpty>
                                                        No nationality found.
                                                    </CommandEmpty>

                                                    {NATIONALITIES.map((item) => (
                                                        <CommandItem
                                                            key={item}
                                                            value={item}
                                                            onSelect={() => {
                                                                setValue(
                                                                    "nationality",
                                                                    item,
                                                                    {
                                                                        shouldValidate: true,
                                                                    },
                                                                );

                                                                setValue(
                                                                    "nationalityOther",
                                                                    "",
                                                                );

                                                                setNationalityOpen(false);
                                                            }}
                                                        >
                                                            {item}

                                                            {nationality === item && (
                                                                <Check className="ml-auto h-4 w-4" />
                                                            )}
                                                        </CommandItem>
                                                    ))}

                                                    <CommandItem
                                                        value="other"
                                                        onSelect={() => {
                                                            setValue(
                                                                "nationality",
                                                                "__other__",
                                                                {
                                                                    shouldValidate: true,
                                                                },
                                                            );

                                                            setNationalityOpen(false);
                                                        }}
                                                    >
                                                        Other

                                                        {nationality === "__other__" && (
                                                            <Check className="ml-auto h-4 w-4" />
                                                        )}
                                                    </CommandItem>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>

                                    {nationality === "__other__" && (
                                        <Input
                                            {...register("nationalityOther")}
                                            className="mt-2"
                                            placeholder="Enter your nationality"
                                        />
                                    )}

                                    {errors.nationality && (
                                        <p className="mt-1 text-xs text-destructive">
                                            {errors.nationality.message}
                                        </p>
                                    )}

                                    {nationality === "__other__" &&
                                        errors.nationalityOther && (
                                            <p className="mt-1 text-xs text-destructive">
                                                {errors.nationalityOther.message}
                                            </p>
                                        )}
                                </div>

                                {/* Blood group */}
                                <div>
                                    <Label className="text-xs uppercase tracking-wide">
                                        Blood group
                                    </Label>

                                    <Select
                                        value={watch("bloodGroup")}
                                        onValueChange={(value) =>
                                            setValue("bloodGroup", value, {
                                                shouldValidate: true,
                                            })
                                        }
                                    >
                                        <SelectTrigger className="mt-1.5">
                                            <SelectValue placeholder="Select blood group" />
                                        </SelectTrigger>

                                        <SelectContent>
                                            {BLOOD_GROUPS.map((group) => (
                                                <SelectItem
                                                    key={group}
                                                    value={group}
                                                >
                                                    {group}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    {errors.bloodGroup && (
                                        <p className="mt-1 text-xs text-destructive">
                                            {errors.bloodGroup.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </SectionCard>

                        <SaveActions
                            navigate={navigate}
                            isSubmitting={isSubmitting}
                        />
                    </form>
                </TabsContent>

                {/* ================================================================== */}
                {/* CONTACT + ADDRESS                                                  */}
                {/* ================================================================== */}

                <TabsContent value="contact">
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-6"
                    >
                        <SectionCard title="Contact information">
                            <div className="mb-5 flex items-start gap-3 rounded-lg border border-border/50 bg-muted/20 p-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <Mail className="h-4 w-4" />
                                </div>

                                <div>
                                    <p className="text-sm font-medium">
                                        How we can reach you
                                    </p>

                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        Keep your personal and phone contact details
                                        up to date.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <Label className="text-xs uppercase tracking-wide">
                                        Personal email
                                    </Label>

                                    <Input
                                        type="email"
                                        {...register("personalEmail")}
                                        className="mt-1.5"
                                        placeholder="you@example.com"
                                    />

                                    {errors.personalEmail && (
                                        <p className="mt-1 text-xs text-destructive">
                                            {errors.personalEmail.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label className="text-xs uppercase tracking-wide">
                                        Mobile
                                    </Label>

                                    <Input
                                        {...register("mobile")}
                                        className="mt-1.5"
                                        placeholder="Mobile number"
                                    />

                                    {errors.mobile && (
                                        <p className="mt-1 text-xs text-destructive">
                                            {errors.mobile.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label className="text-xs uppercase tracking-wide">
                                        Work phone
                                    </Label>

                                    <Input
                                        {...register("workPhone")}
                                        className="mt-1.5"
                                        placeholder="Work phone number"
                                    />
                                </div>
                            </div>
                        </SectionCard>

                        <SectionCard title="Address">
                            <div className="mb-5 flex items-start gap-3 rounded-lg border border-border/50 bg-muted/20 p-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <MapPin className="h-4 w-4" />
                                </div>

                                <div>
                                    <p className="text-sm font-medium">
                                        Residential address
                                    </p>

                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        Make sure your address information is
                                        accurate.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <div className="md:col-span-2">
                                    <Label className="text-xs uppercase tracking-wide">
                                        Address line 1
                                    </Label>

                                    <Input
                                        {...register("address.line1")}
                                        className="mt-1.5"
                                    />

                                    {errors.address?.line1 && (
                                        <p className="mt-1 text-xs text-destructive">
                                            {errors.address.line1.message}
                                        </p>
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <Label className="text-xs uppercase tracking-wide">
                                        Address line 2
                                    </Label>

                                    <Input
                                        {...register("address.line2")}
                                        className="mt-1.5"
                                        placeholder="Apartment, landmark, etc."
                                    />
                                </div>

                                <div>
                                    <Label className="text-xs uppercase tracking-wide">
                                        City
                                    </Label>

                                    <Input
                                        {...register("address.city")}
                                        className="mt-1.5"
                                    />

                                    {errors.address?.city && (
                                        <p className="mt-1 text-xs text-destructive">
                                            {errors.address.city.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label className="text-xs uppercase tracking-wide">
                                        State
                                    </Label>

                                    <Input
                                        {...register("address.state")}
                                        className="mt-1.5"
                                    />

                                    {errors.address?.state && (
                                        <p className="mt-1 text-xs text-destructive">
                                            {errors.address.state.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label className="text-xs uppercase tracking-wide">
                                        Country
                                    </Label>

                                    <Input
                                        {...register("address.country")}
                                        className="mt-1.5"
                                    />

                                    {errors.address?.country && (
                                        <p className="mt-1 text-xs text-destructive">
                                            {errors.address.country.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label className="text-xs uppercase tracking-wide">
                                        Postal code
                                    </Label>

                                    <Input
                                        {...register("address.postal")}
                                        className="mt-1.5"
                                    />

                                    {errors.address?.postal && (
                                        <p className="mt-1 text-xs text-destructive">
                                            {errors.address.postal.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </SectionCard>

                        <SaveActions
                            navigate={navigate}
                            isSubmitting={isSubmitting}
                        />
                    </form>
                </TabsContent>

                {/* ================================================================== */}
                {/* SKILLS                                                             */}
                {/* ================================================================== */}

                <TabsContent value="skills">
                    <SectionCard
                        title="Skills"
                        action={
                            <Button
                                size="sm"
                                onClick={openAddSkill}
                                disabled={skillsLoading}
                            >
                                <Plus className="mr-1.5 h-3.5 w-3.5" />
                                Add skill
                            </Button>
                        }
                    >
                        <div className="mb-5 flex items-start gap-3 rounded-lg border border-border/50 bg-muted/20 p-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Pencil className="h-4 w-4" />
                            </div>

                            <div>
                                <p className="text-sm font-medium">
                                    Your professional skills
                                </p>

                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    Add skills and keep your proficiency levels
                                    up to date.
                                </p>
                            </div>
                        </div>

                        {skillsLoading ? (
                            <div className="rounded-lg border border-border/50 bg-muted/10 p-6 text-center">
                                <p className="text-sm font-medium">
                                    Loading skills...
                                </p>

                                <p className="mt-1 text-xs text-muted-foreground">
                                    Please wait while we load your skills.
                                </p>
                            </div>
                        ) : skillsError ? (
                            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
                                <p className="text-sm font-medium">
                                    Unable to load skills
                                </p>

                                <p className="mt-1 text-xs text-muted-foreground">
                                    Refresh the page and try again.
                                </p>
                            </div>
                        ) : skills.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-border/70 bg-muted/10 p-8 text-center">
                                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <Plus className="h-5 w-5" />
                                </div>

                                <p className="mt-3 text-sm font-medium">
                                    No skills added yet
                                </p>

                                <p className="mt-1 text-xs text-muted-foreground">
                                    Add your first professional skill to your
                                    profile.
                                </p>

                                <Button
                                    className="mt-4"
                                    size="sm"
                                    onClick={openAddSkill}
                                >
                                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                                    Add your first skill
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {skills.map((skill) => (
                                    <SkillCard
                                        key={skill.id}
                                        skill={skill}
                                        deleting={
                                            skillDeletingId === skill.id
                                        }
                                        onEdit={() =>
                                            openEditSkill(skill)
                                        }
                                        onDelete={() =>
                                            deleteSkill(skill)
                                        }
                                    />
                                ))}
                            </div>
                        )}
                    </SectionCard>

                    <p className="mt-4 text-center text-xs text-muted-foreground">
                        Skills are saved individually when you add, edit or
                        remove them.
                    </p>
                </TabsContent>
            </Tabs>

            {/* ==================================================================== */}
            {/* SKILL DIALOG                                                         */}
            {/* ==================================================================== */}

            <Dialog
                open={skillDialogOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        closeSkillDialog();
                    }
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {skillDialogMode === "add"
                                ? "Add skill"
                                : "Edit skill"}
                        </DialogTitle>

                        <DialogDescription>
                            {skillDialogMode === "add"
                                ? "Choose a skill and set your current proficiency level."
                                : "Update your proficiency level for this skill."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-5 py-2">
                        {skillDialogMode === "add" && (
                            <div>
                                <Label className="text-xs uppercase tracking-wide">
                                    Skill
                                </Label>

                                <Popover
                                    open={skillSelectOpen}
                                    onOpenChange={setSkillSelectOpen}
                                >
                                    <PopoverTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="mt-1.5 w-full justify-between font-normal"
                                        >
                                            <span
                                                className={
                                                    selectedSkillId
                                                        ? ""
                                                        : "text-muted-foreground"
                                                }
                                            >
                                                {selectedSkillId
                                                    ? skillCatalog.find(
                                                        (skill) => skill.id === selectedSkillId,
                                                    )?.name ?? "Select a skill"
                                                    : "Select a skill"}
                                            </span>

                                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                    </PopoverTrigger>

                                    <PopoverContent
                                        className="w-[var(--radix-popover-trigger-width)] p-0"
                                        align="start"
                                    >
                                        <Command>
                                            <CommandInput placeholder="Search skills..." />

                                            <CommandList className="max-h-64 overflow-y-auto">
                                                <CommandEmpty>
                                                    No skill found.
                                                </CommandEmpty>

                                                {availableSkills.map((skill) => (
                                                    <CommandItem
                                                        key={skill.id}
                                                        value={skill.name}
                                                        onSelect={() => {
                                                            setSelectedSkillId(skill.id);
                                                            setSkillSelectOpen(false);
                                                        }}
                                                    >
                                                        {skill.name}

                                                        {selectedSkillId === skill.id && (
                                                            <Check className="ml-auto h-4 w-4" />
                                                        )}
                                                    </CommandItem>
                                                ))}
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        )}

                        {skillDialogMode === "edit" && (
                            <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5">
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                    Skill
                                </p>

                                <p className="mt-1 text-sm font-medium">
                                    {
                                        skillCatalog.find(
                                            (skill) =>
                                                skill.id === selectedSkillId,
                                        )?.name
                                    }
                                </p>
                            </div>
                        )}

                        <div>
                            <Label className="text-xs uppercase tracking-wide">
                                Skill level
                            </Label>

                            <div className="mt-2 grid grid-cols-5 gap-2">
                                {[1, 2, 3, 4, 5].map((level) => {
                                    const active =
                                        selectedSkillLevel === level;

                                    return (
                                        <button
                                            key={level}
                                            type="button"
                                            onClick={() =>
                                                setSelectedSkillLevel(level)
                                            }
                                            className={`flex h-11 items-center justify-center rounded-lg border text-sm font-medium transition-colors ${active
                                                    ? "border-primary bg-primary text-primary-foreground"
                                                    : "border-border bg-background hover:bg-muted"
                                                }`}
                                        >
                                            {level}
                                        </button>
                                    );
                                })}
                            </div>

                            <p className="mt-2 text-xs text-muted-foreground">
                                1 = Beginner · 5 = Expert
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={closeSkillDialog}
                            disabled={skillSaving}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="button"
                            onClick={saveSkill}
                            disabled={
                                skillSaving ||
                                (skillDialogMode === "add" &&
                                    !selectedSkillId)
                            }
                        >
                            <Save className="mr-1.5 h-3.5 w-3.5" />

                            {skillSaving
                                ? "Saving..."
                                : skillDialogMode === "add"
                                    ? "Add skill"
                                    : "Save changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Skill card                                                                 */
/* -------------------------------------------------------------------------- */

function SkillCard({
    skill,
    deleting,
    onEdit,
    onDelete,
}: {
    skill: EmployeeSkill;
    deleting: boolean;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const level = Math.min(
        5,
        Math.max(1, Number(skill.level) || 1),
    );

    const percentage = `${level * 20}%`;

    return (
        <div className="rounded-xl border border-border/60 bg-background p-4 transition-colors hover:border-border">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Check className="h-4 w-4" />
                        </div>

                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">
                                {skill.name}
                            </p>

                            <p className="text-xs text-muted-foreground">
                                {skill.endorsed ?? 0} endorsed
                            </p>
                        </div>
                    </div>

                    <div className="mt-4">
                        <div className="mb-1.5 flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                                Level
                            </span>

                            <span className="text-xs font-medium">
                                {level} of 5
                            </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                            <div
                                className="h-full rounded-full bg-primary transition-all"
                                style={{
                                    width: percentage,
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onEdit}
                        disabled={deleting}
                    >
                        <Pencil className="mr-1.5 h-3.5 w-3.5" />
                        Edit
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={onDelete}
                        disabled={deleting}
                    >
                        {deleting ? (
                            <X className="mr-1.5 h-3.5 w-3.5" />
                        ) : (
                            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                        )}

                        {deleting ? "Removing..." : "Delete"}
                    </Button>
                </div>
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Save actions                                                               */
/* -------------------------------------------------------------------------- */

function SaveActions({
    navigate,
    isSubmitting,
}: {
    navigate: ReturnType<typeof useNavigate>;
    isSubmitting: boolean;
}) {
    return (
        <div className="border-t border-border/60 pt-6">
            <div className="flex justify-center gap-3">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                        navigate({
                            to: "/profile/personal",
                        })
                    }
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>

                <Button
                    type="submit"
                    disabled={isSubmitting}
                >
                    <Save className="mr-1.5 h-3.5 w-3.5" />

                    {isSubmitting
                        ? "Saving..."
                        : "Save changes"}
                </Button>
            </div>

            <p className="mt-3 text-center text-xs text-muted-foreground">
                Your changes will be saved to your employee profile.
            </p>
        </div>
    );
}