import React from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import { green } from '@material-ui/core/colors';
import {Button, CircularProgress} from '@material-ui/core';

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
        alignItems: 'center',
    },
    wrapper: {
        margin: theme.spacing(1),
        position: 'relative',
    },
    buttonProgress: {
        color: green[500],
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -12,
        marginLeft: -12,
    },
}));

export default function CircularProgressButton(props) {
    const classes = useStyles();
    const [loading, setLoading] = React.useState(false);

    const handleButtonClick = (onClick) => {
        if (!loading) {
            setLoading(true)
            onClick(setDone)
        }
    };

    const setDone = () => {
        setLoading(false);
    }

    return (
        <div className={classes.root}>
            <div className={classes.wrapper}>
                <Button
                    variant="contained"
                    color="default"
                    disabled={loading}
                    onClick={() => handleButtonClick(props.onClick)}
                >
                    {props.children}
                </Button>
                {loading && <CircularProgress size={24} className={classes.buttonProgress} />}
            </div>
        </div>
    );
}