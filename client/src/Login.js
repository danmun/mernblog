import React, { useState } from "react";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import AlertBox, { variants } from "./AlertBox";
import { login } from "./api/auth";

export default function Login(props) {
    const classes = useStyles();

    const [alertBox, setAlertBox] = useState({
        open: false,
        variant: null,
        message: null,
    });

    const [form, setForm] = useState({
        username: "",
        password: "",
    });

    let onSubmit = function (event) {
        event.preventDefault();
        authenticate(props.handleLogin, setAlertBox, form);
    };

    let onUsernameChanged = function (event) {
        let username = event.target.value;
        setForm({
            ...form,
            username: username,
        });
    };

    let onPasswordChanged = function (event) {
        let password = event.target.value;
        setForm({
            ...form,
            password: password,
        });
    };

    return (
        // i don't know why this requires height of 85vh to get a height which fills parent
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <div className={classes.paper}>
                <Avatar className={classes.avatar}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Sign in
                </Typography>
                <form className={classes.form} noValidate>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        autoFocus
                        onChange={onUsernameChanged}
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        onChange={onPasswordChanged}
                    />
                    {/*<FormControlLabel*/}
                    {/*control={<Checkbox value="remember" color="primary" />}*/}
                    {/*label="Remember me"*/}
                    {/*/>*/}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                        onClick={onSubmit}
                    >
                        Sign In
                    </Button>
                    {/*<Grid container>*/}
                    {/*<Grid item xs>*/}
                    {/*<Link href="#" variant="body2">*/}
                    {/*{"Forgot password?"}*/}
                    {/*</Link>*/}
                    {/*</Grid>*/}
                    {/*<Grid item>*/}
                    {/*<Link href="#" variant="body2">*/}
                    {/*{"Don't have an account? Sign Up"}*/}
                    {/*</Link>*/}
                    {/*</Grid>*/}
                    {/*</Grid>*/}
                </form>
            </div>
            <div>
                <AlertBox
                    open={alertBox.open}
                    variant={alertBox.variant}
                    message={alertBox.message}
                    onClose={() => setAlertBox({ ...alertBox, open: false })}
                />
            </div>
        </Container>
    );
}

async function authenticate(handleLogin, setAlertBox, form) {
    if (await login(form)) {
        handleLogin();
    } else {
        setAlertBox({
            open: true,
            variant: variants.error,
            message: "Incorrect login credentials!",
        });
    }
}

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
}));
