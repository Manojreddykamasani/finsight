// components/Input.jsx
export default function Input({ label, type="text", ...props }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">{label}</span>
      <input type={type} className="input" {...props} />
    </label>
  );
}
