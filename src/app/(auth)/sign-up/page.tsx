/* eslint-disable react-hooks/rules-of-hooks */
'use client'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import axios, {AxiosError} from "axios"
import * as z from "zod"
import Link from "next/link"
import { useEffect, useState } from "react"
import {useDebounceCallback} from "usehooks-ts"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { signUpSchema } from "@/schemas/signUpSchema"
import { ApiResponse } from "@/types/ApiResponse"
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

const page = () => {
    const [username, setUsername] = useState("");
    const [usernameMessage, setUsernameMessage] = useState("");
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const debounceUsername = useDebounceCallback(setUsername, 300);
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            username: "",
            email: "",
            password: "",
        }
    })
    useEffect(() => {
        const checkUsernameUnique = async () => { 
            if(username) {
                setIsCheckingUsername(true);
                setUsernameMessage("");
                try {
                    const response = await axios.get(`/api/check-username-unique?username=${username}`);
                    setUsernameMessage(response.data.message);
                } catch (error) {
                    const axiosError = error as AxiosError<ApiResponse>;
                    setUsernameMessage(axiosError.response?.data.message ?? "An error occurred");
                } finally {
                    setIsCheckingUsername(false);
                
                }
            }
        }
        checkUsernameUnique();
    }, [username]);
    
    const onSubmit = async (data: z.infer<typeof signUpSchema>) => { 
        setIsSubmitting(true);
        try {
            const response = await axios.post<ApiResponse>("/api/sign-up", data);
            toast({
                title: response.data.message,
                description: "Please verify your email to continue"
            });
            router.replace(`/verify/${username}`)
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast({
                title: axiosError.response?.data.message ?? "An error occurred",
                description: "Please try again",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    }
    return (
        <div className="flex justify-center items-center min-h-screen ">
            <div className="w-full max-w-md p-8 space-y-8 rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-tight lg:text-5xl mb-3">
                        Feed Tube
                    </h1>
                    <p className="mb-4">Sign up to continue</p>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            name="username"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <Input
                                        {...field}
                                        onChange={(e:any) => {
                                            field.onChange(e);
                                            debounceUsername(e.target.value);
                                        }}
                                    />
                                    {isCheckingUsername && <Loader2 className="animate-spin" />}
                                    {!isCheckingUsername && usernameMessage && (
                                        <p
                                            className={`text-sm ${usernameMessage === 'Username is unique.'
                                                    ? 'text-green-500'
                                                    : 'text-red-500'
                                                }`}
                                        >
                                            {usernameMessage}
                                        </p>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="email"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <Input {...field} name="email" />
                                    <p className='text-gray-400 text-sm'>We will send you a verification code</p>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            name="password"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <Input type="password" {...field} name="password" />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className='w-full' disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Please wait
                                </>
                            ) : (
                                'Sign Up'
                            )}
                        </Button>
                    </form>
                </Form>
                <div className="text-center mt-4">
                    <p>
                        Already a member?{' '}
                        <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default page