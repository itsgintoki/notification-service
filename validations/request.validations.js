import {z} from "zod";

export const SignUpPostRequestSchema = z.object({
    name:z.string().min(3,"First name is required").max(55),
    email:z.string().email("Invalid email address").max(255),
    password: z.string().min(8,"Password should atleast be 8 characters long!"),
})

export const LoginPostRequestSchema = z.object({
    email:z.string().email("Invalid email").max(255),
    password:z.string().min(8,"Password should atleast be 8 characters long!")
})

export const SendNotificationSchema = z.object({
    channel: z.enum(["EMAIL", "SMS", "PUSH"]),
    title: z.string().min(4, "Title is required").max(255),
    message: z.string().min(4, "Please give the message!")
});
