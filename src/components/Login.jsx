import styles from "./Login.module.css";
import { useState, useContext, useEffect } from "react";
import { Field } from "@base-ui-components/react/field";
import { Form } from "@base-ui-components/react/form";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { toast, Bounce } from "react-toastify";
import { CircularProgress } from "@mui/material";
import { useNavigate } from "react-router";
import { SessionContext } from "../context/SessionContext";

export function Login({ value }) {
  const {
    handleSignIn,
    handleSignUp,
    handleAdminSignIn,  // 🔥 NOVO
    session,
    sessionLoading,
    sessionMessage,
    sessionError,
  } = useContext(SessionContext);

  const navigate = useNavigate();

  // Se já estiver logado
  useEffect(() => {
    if (session) navigate("/");
  }, [session, navigate]);

  const [errors, setErrors] = useState({});
  const [mode, setMode] = useState("signin");
  const [showPassword, setShowPassword] = useState(false);

  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
  });

  // TOASTS
  useEffect(() => {
    if (sessionMessage) {
      toast.success(sessionMessage, {
        position: "top-center",
        autoClose: 5000,
        theme: localStorage.getItem("theme"),
        transition: Bounce,
      });
    } else if (sessionError) {
      toast.error(sessionError, {
        position: "top-center",
        autoClose: 5000,
        theme: localStorage.getItem("theme"),
        transition: Bounce,
      });
    }
  }, [sessionMessage, sessionError]);

  async function handleSubmit(e) {
    e.preventDefault();

    const newErrors = {};

    if (!formValues.email) newErrors.email = "Email is required";
    if (!formValues.password) newErrors.password = "Password is required";

    if (mode === "register") {
      if (!formValues.username) newErrors.username = "Username is required";
      if (!formValues.confirmPassword)
        newErrors.confirmPassword = "Confirm Password is required";
      if (formValues.password !== formValues.confirmPassword)
        newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    if (mode === "signin") {
      await handleSignIn(formValues.email, formValues.password);
    } else {
      await handleSignUp(
        formValues.email,
        formValues.password,
        formValues.username
      );
    }
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  }

  const handleTogglePassword = () => setShowPassword((s) => !s);

  // 🔥 LOGIN ADMIN
  async function adminLogin() {
    if (!formValues.email || !formValues.password)
      return toast.error("Digite email e senha primeiro!");

    const isAllowed = await handleAdminSignIn(
      formValues.email,
      formValues.password
    );

    if (isAllowed) navigate("/admin");
  }

  return (
    <div className={styles.container}>
      <h1>{mode === "signin" ? "Sign In" : "Register"}</h1>

      {/* 🔥 BOTÃO ADMIN — sempre aparece, não altera cadastro */}
     <button
  className={styles.adminButton}
  style={{
    marginBottom: "1.5rem",
    background: "red",
    color: "white",
    fontSize: "1.4rem",
    padding: "1rem",
    borderRadius: "8px",
  }}
  onClick={() => {
    setMode("signin"); // 🔥 muda para tela de login
  }}
>
  Login Admin
</button>


      {/* FORM LOGIN / REGISTER */}
      <Form className={styles.form} errors={errors} onSubmit={handleSubmit}>
        <Field.Root name="email" className={styles.field}>
          <Field.Label className={styles.label}>Email</Field.Label>
          <Field.Control
            type="email"
            name="email"
            required
            value={formValues.email}
            onChange={handleInputChange}
            placeholder="Enter email"
            className={styles.input}
          />
          <Field.Error className={styles.error} />
        </Field.Root>

        {mode === "register" && (
          <Field.Root name="username" className={styles.field}>
            <Field.Label className={styles.label}>Username</Field.Label>
            <Field.Control
              type="text"
              name="username"
              required
              value={formValues.username}
              onChange={handleInputChange}
              placeholder="Enter username"
              className={styles.input}
            />
            <Field.Error className={styles.error} />
          </Field.Root>
        )}

        <Field.Root name="password" className={styles.field}>
          <Field.Label className={styles.label}>Password</Field.Label>
          <div className={styles.inputWrapper}>
            <Field.Control
              type={showPassword ? "text" : "password"}
              name="password"
              required
              value={formValues.password}
              onChange={handleInputChange}
              placeholder="Enter password"
              className={styles.input}
            />
            <button
              type="button"
              className={styles.iconBtn}
              onClick={handleTogglePassword}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          <Field.Error className={styles.error} />
        </Field.Root>

        {mode === "register" && (
          <Field.Root name="confirmPassword" className={styles.field}>
            <Field.Label className={styles.label}>Confirm Password</Field.Label>
            <Field.Control
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              required
              value={formValues.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm password"
              className={styles.input}
            />
            <Field.Error className={styles.error} />
          </Field.Root>
        )}

        <button type="submit" className={styles.button} disabled={sessionLoading}>
          {sessionLoading ? (
            <CircularProgress size={24} />
          ) : mode === "signin" ? (
            "Sign In"
          ) : (
            "Register"
          )}
        </button>
      </Form>

      {mode === "signin" ? (
        <button onClick={() => setMode("register")} className={styles.info}>
          Don't have an account? Click here!
        </button>
      ) : (
        <button onClick={() => setMode("signin")} className={styles.info}>
          Already have an account? Click here!
        </button>
      )}
    </div>
  );
}
