import { toast } from "sonner";

export const handleErrorApi = (errors: Error[] | undefined) => {
    if (Array.isArray(errors)) {
        for (let i = 0; i < errors.length; i++) {
            toast.error(errors[i].message);
        }
    } else {
        toast.error("Something went wrong, please try again later.");
    }
};
