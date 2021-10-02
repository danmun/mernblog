import React from "react";
import PropTypes from "prop-types";
import { Grid, TextField, CardMedia } from "@material-ui/core";
import CircularProgressButton from "../common/CircularProgressButton";
import { check, enrol, confirm, remove } from "../api/2fa";
import AlertBox, { variants } from "../common/AlertBox";
import { isValid2faCode, copyToClipBoard } from "../utils";

const initialCreds = {
    password: "",
    secret: "",
    code: "",
    qr: "",
};

class MfaManager extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            enabled: false,
            message: "",
            success: false,
            isSubmitting: false,
            ...initialCreds,
        };

        this.startEnrolment = this.startEnrolment.bind(this);
        this.confirmEnrolment = this.confirmEnrolment.bind(this);
        this.removeEnrolment = this.removeEnrolment.bind(this);

        this.renderPasswordConfirmComponent = this.renderPasswordConfirmComponent.bind(this);
        this.renderCodeConfirmComponent = this.renderCodeConfirmComponent.bind(this);
        this.renderInputFieldComponent = this.renderInputFieldComponent.bind(this);
        this.renderSubmitButtonComponent = this.renderSubmitButtonComponent.bind(this);
        this.renderAlertComponent = this.renderAlertComponent.bind(this);

        this.onChangePasswordText = this.onChangePasswordText.bind(this);
        this.onChangeCodeText = this.onChangeCodeText.bind(this);

        this.clipboard = this.clipboard.bind(this);
    }

    componentDidMount() {
        check().then((json) => {
            const { enabled } = json;
            this.setState({ enabled });
        });
    }

    onChangePasswordText(event) {
        const password = event.target.value;
        this.setState({ password });
    }

    onChangeCodeText(event) {
        const code = event.target.value;
        if (isValid2faCode(code)) this.setState({ code });
    }

    startEnrolment() {
        this.setState({ isSubmitting: true });
        const { password } = this.state;
        enrol({ password }).then((json) => {
            const { secret, qr, success, message } = json;
            // we clear the password on success so that it doesn't hang around
            const password = "",
                isSubmitting = false;
            const newState = success
                ? { secret, qr, message, success, password, isSubmitting }
                : { message, success, isSubmitting };
            this.setState(newState);
        });
    }

    confirmEnrolment() {
        this.setState({ isSubmitting: true });
        const { code, secret } = this.state;
        confirm({ code, secret }).then((json) => {
            const { message, success } = json;
            const secret = "",
                qr = "",
                enabled = true,
                isSubmitting = false;
            const newState = success
                ? { enabled, secret, qr, message, success, isSubmitting }
                : { message, success, isSubmitting };
            this.setState(newState);
        });
    }

    removeEnrolment() {
        this.setState({ isSubmitting: true });
        const { password } = this.state;
        remove({ password }).then((json) => {
            const { message, success } = json;
            const password = "",
                enabled = false,
                isSubmitting = false;
            const newState = success
                ? { enabled, success, password, isSubmitting }
                : { message, success, isSubmitting };
            this.setState(newState);
        });
    }

    clipboard() {
        copyToClipBoard(this.state.secret);
    }

    renderPasswordConfirmComponent() {
        const { enabled, password } = this.state;
        const onSubmit = enabled ? this.removeEnrolment : this.startEnrolment;
        const buttonText = enabled ? "Disable" : "Enrol";
        const buttonDisabled = !password;
        return (
            <React.Fragment>
                <Grid item style={styles.alignment.center}>
                    {this.renderInputFieldComponent(
                        this.onChangePasswordText,
                        "Password",
                        null,
                        { type: "password" }
                    )}
                </Grid>
                <Grid item style={styles.alignment.center}>
                    {this.renderSubmitButtonComponent(
                        onSubmit,
                        buttonText,
                        buttonDisabled
                    )}
                </Grid>
            </React.Fragment>
        );
    }

    renderCodeConfirmComponent() {
        const { code } = this.state;
        const buttonDisabled = !code;
        const onSubmit = this.confirmEnrolment;
        return (
            <React.Fragment>
                <Grid item>
                    {/* https://stackoverflow.com/a/56403865 */}
                    <div style={styles.qr.container} onClick={this.clipboard}>
                        <CardMedia
                            style={styles.qr.element}
                            image={this.state.qr}
                        />
                    </div>
                </Grid>
                <Grid item style={styles.alignment.center}>
                    Scan the QR code above or click it to copy the 2FA secret
                    for your an authenticator app.
                </Grid>
                <Grid item style={styles.alignment.center}>
                    {/* we need to sanitize the code, so need to use a controlled text input (i.e. set its value from state) */}
                    {this.renderInputFieldComponent(
                        this.onChangeCodeText,
                        "6-digit code",
                        code,
                        { maxLength: 6 }
                    )}
                </Grid>
                <Grid item style={styles.alignment.center}>
                    {this.renderSubmitButtonComponent(
                        onSubmit,
                        "Confirm",
                        buttonDisabled
                    )}
                </Grid>
            </React.Fragment>
        );
    }

    renderInputFieldComponent(onInputChange, label, value, inputProps) {
        if (!inputProps) inputProps = {};
        return (
            <TextField
                variant={"outlined"}
                margin={"normal"}
                required
                fullWidth
                id={"inputFieldComponent"}
                label={label}
                name={"inputFieldComponent"}
                value={value}
                inputProps={inputProps}
                onChange={onInputChange}
            />
        );
    }

    renderSubmitButtonComponent(onSubmit, buttonText, disabled) {
        return (
            <CircularProgressButton
                loading={this.state.isSubmitting}
                onClick={onSubmit}
                variant={"contained"}
                color={"primary"}
                disabled={disabled}
            >
                {buttonText}
            </CircularProgressButton>
        );
    }

    renderAlertComponent() {
        return (
            <AlertBox
                open={this.state.message}
                variant={this.state.success ? variants.success : variants.error}
                message={this.state.message}
                onClose={() => this.setState({ message: "" })}
            />
        );
    }

    render() {
        const { enabled, secret, qr } = this.state;
        const enrolling = !enabled && secret && qr;
        const renderSection = enrolling
            ? this.renderCodeConfirmComponent
            : this.renderPasswordConfirmComponent;

        return (
            <React.Fragment>
                <div style={styles.container}>
                    {renderSection()}
                    <div>{this.renderAlertComponent()}</div>
                </div>
            </React.Fragment>
        );
    }
}

const styles = {
    container: {
        minHeight: "50vh",
        maxHeight: "50vh",
        minWidth: "15vw",
        maxWidth: "15vw",
    },
    qr: {
        container: {
            display: "flex",
            justifyContent: "center",
            cursor: "pointer",
        },
        element: {
            width: "166px",
            height: "166px",
        },
    },
    alignment: {
        center: {
            textAlign: "center",
        },
    },
};

MfaManager.propTypes = {
    onCreated: PropTypes.func,
    onEdited: PropTypes.func,
    post: PropTypes.object,
};

export default MfaManager;
