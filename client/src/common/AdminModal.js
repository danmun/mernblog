import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import CancelIcon from "@material-ui/icons/Cancel";
import { Fade, Grid, IconButton, Backdrop, Modal } from "@material-ui/core";
import PropTypes from "prop-types";

const backdropProps = {
    timeout: 500,
};

function AdminModal(props) {
    const classes = useStyles();
    // getModalStyle is not a pure function, we roll the style only on the first render
    let open = props.open;

    if (open) {
        document.body.classList.add("modal-open");
    } else {
        document.body.classList.remove("modal-open");
    }
    return (
        <div>
            <Modal
                style={style.modalElement}
                disableBackdropClick={true}
                disableEscapeKeyDown={true}
                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                className={classes.modal}
                open={open}
                onClose={props.dispose}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={backdropProps}
            >
                <Fade in={props.open}>
                    <div className={classes.paper}>
                        <Grid
                            container
                            direction="column"
                            justify="space-between"
                            alignItems="center"
                            style={style.modal.container}
                        >
                            <Grid item style={style.modal.title.grid}>
                                <div style={style.modal.title.container}>
                                    <div>
                                        <h2>{props.title}</h2>
                                    </div>
                                    <div>
                                        <IconButton
                                            style={style.modal.title.button}
                                            edge="start"
                                            onClick={props.dispose}
                                        >
                                            <CancelIcon />
                                        </IconButton>
                                    </div>
                                </div>
                            </Grid>
                            {props.children}
                        </Grid>
                    </div>
                </Fade>
            </Modal>
        </div>
    );
}

const useStyles = makeStyles((theme) => ({
    paper: {
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    },
}));

const style = {
    modalElement: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "auto",
        width: "73vw"
    },
    modal: {
        container: {
            width: "100%",
        },
        title: {
            grid: {
                width: "100%",
            },
            container: {
                width: "100%",
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
            },
            button: {
                padding: "7px",
                marginLeft: "0px",
                position: "relative",
                top: "12px",
            },
        },
    },
};

AdminModal.propTypes = {
    title: PropTypes.string,
    open: PropTypes.bool,
    dispose: PropTypes.func,
    children: PropTypes.any,
};

export default AdminModal;
