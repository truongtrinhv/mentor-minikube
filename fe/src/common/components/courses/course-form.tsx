import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/common/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/common/components/ui/form";
import { Input } from "@/common/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/common/components/ui/select";
import { Textarea } from "@/common/components/ui/textarea";
import { cn } from "@/common/lib/utils";
import type { Course } from "@/common/types/course";

import { CourseResourcePicker } from "./course-resource-picker";

import courseCategoryService from "../../../modules/AdminPage/ManageCourseCategoryPage/services/courseCategoryService";
import type { CourseCategoryLookUpResponse } from "../../../modules/AdminPage/ManageCourseCategoryPage/types/course-response";
import { courseFormDataSchema } from "../../schemas/course";
import type { CourseFormData } from "../../types/course";
import { SelectWithRemoteSearch } from "../input/select-with-remote-search";

type CourseFormProps = {
    course?: Course;
    onSubmit: (data: CourseFormData) => void;
    isLoading?: boolean;
    className?: string;
};

const categoryRemoteSearchQueryFunction = async (_: string) => {
    try {
        const result = await courseCategoryService.lookup();
        const data = result.data;
        return data || [];
    } catch (e: any) {
        return [];
    }
};

export const CourseForm = ({
    course,
    onSubmit,
    isLoading = false,
    className,
}: CourseFormProps) => {
    const form = useForm({
        resolver: zodResolver(courseFormDataSchema),
        defaultValues: {
            title: course?.title || "",
            description: course?.description || "",
            courseCategoryId: course?.category.id || "",
            level: (course?.level ?? 0) as 0 | 1 | 2,
            resourceIds: course?.resources.map((r) => r.id) || [],
        },
    });

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className={cn("flex flex-col gap-6", className)}
            >
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="E.g.: JavaScript Fundamentals"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                {field.value.trim().length} / 100
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Enter your course description."
                                    rows={5}
                                    className="field-sizing-fixed resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                {field.value.trim().length} / 2000
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="courseCategoryId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Category</FormLabel>
                            <FormControl>
                                <SelectWithRemoteSearch<CourseCategoryLookUpResponse>
                                    initialSearchQuery={
                                        course?.category.name || ""
                                    }
                                    value={field.value}
                                    onChange={(value) => field.onChange(value)}
                                    getValue={(category) => category.id}
                                    getLabel={(category) => category.name}
                                    queryFunction={
                                        categoryRemoteSearchQueryFunction
                                    }
                                    queryKey="course-category"
                                    refetchOptionsOnSearch={false}
                                    className="w-72"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="level"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Course level</FormLabel>
                            <FormControl>
                                <Select
                                    onValueChange={(value) =>
                                        field.onChange(Number(value))
                                    }
                                    value={`${field.value}`}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0">
                                            Beginner
                                        </SelectItem>
                                        <SelectItem value="1">
                                            Intermediate
                                        </SelectItem>
                                        <SelectItem value="2">
                                            Advanced
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="resourceIds"
                    render={() => (
                        <FormItem>
                            <FormLabel>Course resources</FormLabel>
                            <FormControl className="min-w-0">
                                <CourseResourcePicker
                                    initialSelectedResources={course?.resources}
                                    onChange={(ids) =>
                                        form.setValue("resourceIds", ids)
                                    }
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button
                    type="submit"
                    className="w-fit self-start"
                    disabled={isLoading}
                >
                    {isLoading && (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                    )}
                    {!course ? "Add course" : "Save changes"}
                </Button>
            </form>
        </Form>
    );
};
