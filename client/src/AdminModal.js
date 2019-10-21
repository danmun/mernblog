import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import CancelIcon from '@material-ui/icons/Cancel';
import {Fade, Grid, IconButton, Backdrop, Modal} from '@material-ui/core';

const useStyles = makeStyles(theme => ({
    paper: {
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    },
}));

export default function AdminModal(props) {
    const classes = useStyles();
    // getModalStyle is not a pure function, we roll the style only on the first render
    let open = props.open

    if(open){
        document.body.classList.add('modal-open');
    }else{
        document.body.classList.remove('modal-open');
    }
    return (
        <div>
            <Modal
                style={{display:'flex', alignItems:'center', justifyContent:'center', margin: "auto", width: "80vw"}}
                disableBackdropClick={true}
                disableEscapeKeyDown={true}
                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                className={classes.modal}
                open={open}
                onClose={props.dispose}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 500,
                }}
            >
                <Fade in={props.open}>
                    <div className={classes.paper}>
                        <Grid
                            container
                            direction="column"
                            justify="space-between"
                            alignItems="center"
                            style={{width: "100%"}}
                        >
                            <Grid item style={{width: "100%"}}>
                                <div style={{width: "100%", display: "flex", flexDirection: "row", justifyContent:"space-between"}}>
                                    <div>
                                        <h2>{props.title}</h2>
                                    </div>
                                    <div>
                                        <IconButton
                                            style={{
                                                padding: "7px",
                                                marginLeft: "0px",
                                                position: "relative",
                                                top: "12px"
                                            }}
                                            edge="start"
                                            onClick={props.dispose}
                                            // className={classes.menuButton}
                                        >
                                            <CancelIcon/>
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