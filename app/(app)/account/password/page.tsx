import ChangePasswordForm from "./change-password-form";

export default function ChangePasswordPage() {
  return (
    <div className="max-w-[520px]">
      <h1 className="text-[28px] font-bold leading-[34px]">Change password</h1>
      <p className="mt-2 text-sm leading-[21px] text-[#52525B]">
        Confirm your current password, then choose a new one.
      </p>

      <div className="mt-8 rounded-xl border border-[#E4E4E7] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
