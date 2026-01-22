import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/common/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/common/components/ui/form";
import { Input } from "@/common/components/ui/input";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/common/components/ui/sheet";
import { Textarea } from "@/common/components/ui/textarea";
import {
    FormMode,
    type FormSetting,
    formSettingDefault,
} from "@/common/types/ui";

import { courseCategorySchema } from "../schemas/course-category-schema";
import type { CourseCategoryRequest } from "../types/course-request";
import type { CourseCategoryDetailResponse } from "../types/course-response";

type FormDetailProps = {
    formSetting: FormSetting;
    setFormSetting: (setting: FormSetting) => void;
    data?: CourseCategoryDetailResponse;
    title?: string;
    onSubmit?: (data: CourseCategoryRequest) => void;
};

export default function FormDetails(props: FormDetailProps) {
    const {
        formSetting = formSettingDefault,
        setFormSetting = () => {},
        data,
        onSubmit = () => {},
        title = "Details",
    } = props;
    const form = useForm<CourseCategoryRequest>({
        resolver: zodResolver(courseCategorySchema),
        defaultValues: data ?? {
            name: "",
            description: "",
            isActive: true,
        },
    });

    const disableField = useMemo(() => {
        if (formSetting.mode == FormMode.VIEW) return true;
        return false;
    }, [formSetting.mode]);

    useEffect(() => {
        if (data) form.reset(data);
    }, [data]);

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log("OKOK");
        form.handleSubmit(onSubmit)();
    };

    return (
        <Sheet
            open={formSetting.open}
            onOpenChange={(v: boolean) => {
                setFormSetting({ ...formSetting, open: v });
                form.reset();
            }}
        >
            <SheetContent
                onInteractOutside={(event: Event) => event.preventDefault()}
                className="flex flex-col"
            >
                <SheetHeader className="text-left">
                    <SheetTitle>
                        {formSetting.mode} {title}
                    </SheetTitle>
                    <SheetDescription>
                        {formSetting.mode == FormMode.EDIT &&
                            "Update details by providing necessary info."}
                        {formSetting.mode == FormMode.ADD &&
                            "Add a new record by providing necessary info."}
                        Click save when you&apos;re done.
                    </SheetDescription>
                </SheetHeader>
                <Form {...form}>
                    <form
                        id="tasks-form"
                        onSubmit={handleFormSubmit}
                        className="flex-1 space-y-5 px-4"
                    >
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem className="space-y-1">
                                    <FormLabel className="!text-current">
                                        Name
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            maxLength={50}
                                            readOnly={disableField}
                                            {...field}
                                            placeholder="Enter a name"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem className="space-y-1">
                                    <FormLabel className="!text-current">
                                        Description
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            maxLength={200}
                                            readOnly={disableField}
                                            {...field}
                                            className="max-h-[10rem] resize-none"
                                            placeholder="Enter description"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {formSetting.mode == FormMode.EDIT && (
                            <FormField
                                control={form.control}
                                name="isActive"
                                render={({ field }) => (
                                    <FormItem className="my-3 flex items-center space-y-1 rounded-md border p-2 shadow-sm">
                                        <FormLabel className="mb-0">
                                            Active
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="checkbox"
                                                readOnly={disableField}
                                                checked={field.value}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        e.target.checked,
                                                    )
                                                }
                                                className="text-primary focus:ring-primary h-4 w-4 rounded border-gray-300"
                                                name={field.name}
                                                ref={field.ref}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        )}
                        {formSetting.mode == FormMode.VIEW && (
                            <div>
                                {data?.courses.length ? (
                                    <div className="space-y-2">
                                        <div className="mb-2 font-semibold text-gray-700">
                                            Courses in this category:
                                        </div>
                                        <div className="max-h-[20vh] space-y-2 overflow-y-auto pr-1 md:max-h-[30vh] lg:max-h-[40vh]">
                                            {" "}
                                            {data.courses.map((course) => (
                                                <div
                                                    key={course.id}
                                                    className="flex flex-col rounded-md border border-gray-200 bg-white p-3 shadow-sm transition hover:shadow"
                                                >
                                                    <div className="text-primary truncate font-medium">
                                                        {course.title}
                                                    </div>
                                                    <div className="mt-1 line-clamp-2 text-sm text-gray-500">
                                                        {course.description}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-gray-400 italic">
                                        No courses in this category.
                                    </div>
                                )}
                            </div>
                        )}
                    </form>
                </Form>
                <SheetFooter className="gap-2">
                    <SheetClose asChild>
                        <Button variant="outline">Close</Button>
                    </SheetClose>
                    {!disableField && (
                        <Button form="tasks-form" type="submit">
                            Save changes
                        </Button>
                    )}
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
