// app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
    <SignIn
    appearance={{
      baseTheme: undefined,
      variables: {
        colorBackground: "#18181b",
        colorText: "#fafafa",
        colorPrimary: "#2563eb",
        colorInputBackground: "#09090b",
        colorInputText: "#fafafa",
      },
      elements: {
        formButtonPrimary: "bg-blue-600 hover:bg-blue-700",
          card: "bg-zinc-900 border border-zinc-800",
          headerTitle: "text-zinc-100",
          headerSubtitle: "text-zinc-400",
          socialButtonsBlockButton: "bg-zinc-800 hover:bg-zinc-700 border-zinc-700",
          formFieldLabel: "text-zinc-400",
            formFieldInput: "bg-zinc-950 border-zinc-800 text-zinc-100",
              footerActionLink: "text-blue-500 hover:text-blue-400",
      },
    }}
    redirectUrl="/remotes"
    signUpUrl="/sign-up"
    routing="path"
    />
    </div>
  );
}
