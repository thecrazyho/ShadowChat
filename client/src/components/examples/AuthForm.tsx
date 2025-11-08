import AuthForm from "../AuthForm";

export default function AuthFormExample() {
  return (
    <AuthForm
      onSubmit={async (data) => {
        console.log("Auth submitted:", data);
      }}
    />
  );
}
