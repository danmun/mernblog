import React, { useState } from "react";
import Avatar from "@material-ui/core/Avatar";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import AlertBox, { variants } from "../common/AlertBox";
import { login } from "../api/auth";
import PropTypes from "prop-types";
import { isValid2faCode } from "../utils";
import CircularProgressButton from "../common/CircularProgressButton";

const initialAlertBoxState = {
    open: false,
    message: null,
};

const initialFormData = {
    username: "",
    password: "",
    code: "",
};

const initialFormState = {
    mfaPending: false,
    isSubmitting: false,
};

const Login = (props) => {
    const classes = useStyles();

    const [alertBox, setAlertBox] = useState(initialAlertBoxState);
    const [form, setForm] = useState(initialFormData);
    const [formState, setFormState] = useState(initialFormState);

    const handleLogin = (message, success, mfa) => {
        const isSubmitting = false,
            mfaPending = mfa;
        if (mfa) {
            // mfa initiated
            setFormState({ isSubmitting, mfaPending });
            setAlertBox(initialAlertBoxState);
        } else if (success) {
            // mfa code submitted OR login succeeded
            // clear password from state!
            setForm(initialFormData);
            setFormState(initialFormState);
            setAlertBox(initialAlertBoxState);
            props.handleLogin();
        } else {
            setAlertBox({ open: true, message: message });
            setForm(initialFormData);
            setFormState(initialFormState);
        }
    };

    const onSubmit = async () => {
        setFormState({ ...formState, isSubmitting: true });
        login(form).then((res) => {
            const { message, success, mfa } = res;
            handleLogin(message, success, mfa);
        });
    };

    const onTextChanged = (event) => {
        setForm({
            ...form,
            [event.target.name]: event.target.value,
        });
    };

    const onCodeChanged = (event) => {
        const code = event.target.value;
        if (!isValid2faCode(code)) return;
        setForm({
            ...form,
            code: event.target.value,
        });
    };

    const Form = formState.mfaPending
        ? show2fa(form.code, onCodeChanged)
        : showLogin(form.username, form.password, onTextChanged);
    const screenTitle = formState.mfaPending
        ? "2-factor authentication"
        : "Login";
    // if field is blank, disable button; which fields determine this depends on login type (2fa/pw)
    const buttonDisabled = formState.mfaPending
        ? !form.code
        : !form.password || !form.username;

    return (
        // i don't know why this requires height of 85vh to get a height which fills parent
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <AuthScreen title={screenTitle} classes={classes}>
                {Form}
                <CircularProgressButton
                    loading={formState.isSubmitting}
                    disabled={buttonDisabled}
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className={classes.submit}
                    onClick={onSubmit}
                >
                    Sign In
                </CircularProgressButton>
            </AuthScreen>
            <div>
                <AlertBox
                    open={alertBox.open}
                    // we only show error messages on login/2fa page
                    variant={variants.error}
                    message={alertBox.message}
                    onClose={() => setAlertBox(initialAlertBoxState)}
                />
            </div>
        </Container>
    );
};

const AuthScreen = (props) => {
    const { title, classes, children } = props;
    return (
        <div className={`${classes.paper} ${classes.centered}`}>
            <Avatar className={classes.avatar}>
                <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
                {title}
            </Typography>
            <form className={classes.form} noValidate>
                {children}
            </form>
        </div>
    );
};

const showLogin = (username, password, onTextChanged) => {
    return (
        <React.Fragment>
            {renderInputFieldComponent(
                username,
                onTextChanged,
                "username",
                "Username",
                true,
                null
            )}
            {renderInputFieldComponent(
                password,
                onTextChanged,
                "password",
                "Password",
                false,
                { type: "password" }
            )}
        </React.Fragment>
    );
};

const show2fa = (code, onCodeChanged) => {
    return (
        <React.Fragment>
            {renderInputFieldComponent(
                code,
                onCodeChanged,
                "code",
                "6-digit code",
                true,
                { maxLength: 6 }
            )}
        </React.Fragment>
    );
};

const renderInputFieldComponent = (
    value,
    onTextChanged,
    name,
    label,
    autoFocus,
    inputProps
) => {
    if (!inputProps) inputProps = {};
    return (
        <TextField
            variant={"outlined"}
            margin={"normal"}
            required
            fullWidth
            id={"inputField" + name + label}
            label={label}
            name={name}
            value={value}
            autoFocus={autoFocus}
            inputProps={inputProps}
            onChange={onTextChanged}
        />
    );
};

// TODO: add back commented parts later, they enhance security and convenience
const useStyles = makeStyles((theme) => ({
    "@global": {
        body: {
            backgroundColor: theme.palette.common.white,
        },
    },
    paper: {
        marginTop: theme.spacing(8),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: "100%", // Fix IE 11 issue.
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
    centered: {
        textAlign: "center",
    },
}));

Login.propTypes = {
    handleLogin: PropTypes.func,
};

export default Login;
