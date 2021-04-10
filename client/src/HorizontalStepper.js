import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Button, Icon, StepLabel, Step, Stepper } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
    root: {
        width: "100%",
    },
    button: {
        marginRight: theme.spacing(1),
    },
}));

export default function HorizontalStepper(props) {
    const classes = useStyles();
    const [activeStep, setActiveStep] = React.useState(0);
    const steps = props.steps;

    const handleNext = () => {
        if (props.onNext) props.onNext();
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        if (props.onBack) props.onBack();
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    return (
        <div className={classes.root}>
            <Stepper activeStep={activeStep}>
                {steps.map((label, index) => {
                    const stepProps = {};
                    const labelProps = {};
                    return (
                        <Step key={label} {...stepProps}>
                            <StepLabel {...labelProps}>{label}</StepLabel>
                        </Step>
                    );
                })}
            </Stepper>
            <div style={styles.button.back.container}>
                <Button
                    variant="contained"
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    className={classes.button}
                >
                    Back
                </Button>

                {activeStep === steps.length - 1
                    ? renderSubmitButton(props.onSubmit, classes)
                    : renderNextButton(handleNext, classes)}
            </div>
        </div>
    );
}

function renderNextButton(handleNext, classes) {
    return (
        <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
            className={classes.button}
        >
            Next
        </Button>
    );
}

function renderSubmitButton(onSubmit, classes) {
    return (
        <Button
            variant="contained"
            color="primary"
            onClick={onSubmit}
            className={classes.button}
        >
            Submit
            <Icon>send</Icon>
        </Button>
    );
}

const styles = {
    button: {
        back: {
            container: {
                textAlign: "center",
            },
        },
    },
};
