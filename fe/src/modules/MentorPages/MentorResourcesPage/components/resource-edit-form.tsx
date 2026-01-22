import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Loader2 } from "lucide-react";
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
import { resourceEditFormSchema } from "@/common/schemas/resource";
import type { Resource, ResourceEditFormData } from "@/common/types/resource";

import { useEditResource } from "../hooks/use-edit-resource";

type ResourceEditButtonProps = {
    resource: Resource;
};

export const ResourceEditButton = ({ resource }: ResourceEditButtonProps) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { edit, isPending } = useEditResource();

    const form = useForm({
        resolver: zodResolver(resourceEditFormSchema),
        defaultValues: {
            title: resource.title,
            description: resource.description,
        },
    });

    function onSubmit(values: ResourceEditFormData) {
        edit(
            { resourceId: resource.id, data: values },
            {
                onSuccess: () => {
                    setIsDialogOpen(false);
                },
            },
        );
    }

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    id={`edit-resource-${resource.id}`}
                >
                    <Edit className="size-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex flex-col gap-6"
                    >
                        <DialogHeader>
                            <DialogTitle>Edit resource</DialogTitle>
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

                        <DialogFooter>
                            <Button
                                type="submit"
                                className="w-fit self-start"
                                disabled={isPending}
                            >
                                {isPending && (
                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                )}
                                Save changes
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
