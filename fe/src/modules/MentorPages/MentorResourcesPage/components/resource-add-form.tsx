import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/common/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/common/components/ui/dialog";
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
import { Textarea } from "@/common/components/ui/textarea";
import { resourceAddFormSchema } from "@/common/schemas/resource";
import type { ResourceAddFormData } from "@/common/types/resource";

import { useCreateResource } from "../hooks/use-create-resource";

const formatFileSize = (bytes: number, decimals = 1): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

export const ResourceAddForm = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { create, isPending } = useCreateResource();

    const form = useForm({
        resolver: zodResolver(resourceAddFormSchema),
        defaultValues: {
            title: "",
            description: "",
            file: undefined,
        },
    });

    function onSubmit(values: ResourceAddFormData) {
        create(values, {
            onSuccess: () => {
                form.reset();
                setIsDialogOpen(false);
            },
        });
    }

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button className="ml-auto flex-shrink-0">
                    Add a resource <Plus className="ml-2 size-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex flex-col gap-6"
                    >
                        <DialogHeader>
                            <DialogTitle>Add a new resource</DialogTitle>
                        </DialogHeader>
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="E.g.: Course Introduction Video"
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
                                            placeholder="Enter your resource description."
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
                            name="file"
                            render={() => (
                                <FormItem>
                                    <FormLabel>File</FormLabel>
                                    <FormControl>
                                        <Input
                                            id="file"
                                            type="file"
                                            accept=".jpg,.jpeg,.png,.webp,.doc,.docx,.pdf,.mp4,.mov"
                                            onChange={(e) => {
                                                if (e.target.files?.[0]) {
                                                    form.setValue(
                                                        "file",
                                                        e.target.files[0],
                                                        {
                                                            shouldValidate:
                                                                true,
                                                        },
                                                    );
                                                }
                                            }}
                                        />
                                    </FormControl>
                                    <FormDescription className="text-sm text-gray-500">
                                        <span className="block">
                                            {form.getValues().file &&
                                                `Uploaded document: ${form.getValues().file.name} (Size: ${formatFileSize(
                                                    form.getValues().file.size,
                                                )})`}
                                        </span>
                                        The max file size is 80 MB.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button
                                type="submit"
                                className="w-fit self-start"
                                disabled={isPending}
                            >
                                {isPending && (
                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                )}
                                Add resource
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
