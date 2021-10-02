import React from "react";
import Grid from "@material-ui/core/Grid";
import { TextField } from "@material-ui/core";
import CircularProgressButton from "../common/CircularProgressButton";
import DeleteIcon from "@material-ui/icons/Delete";
import { deletePost } from "../api/posts";
import PropTypes from "prop-types";

class DeleteConfirmation extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            title: "",
            doDelete: false,
            isSubmitting: false,
        };

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(event) {
        this.setState({ isSubmitting: true });
        const post = this.props.toDelete;
        let that = this;
        deletePost(post).then((json) => {
            // maybe best to check if json.status === 200 etc...
            this.setState({ isSubmitting: false });
            that.props.onConfirm(post);
        });
    }

    render() {
        return (
            <React.Fragment>
                <Grid item style={styles.title.container}>
                    <TextField
                        disabled
                        style={styles.title.inputField}
                        id="outlined-disabled"
                        label="Title"
                        defaultValue={this.props.toDelete.title}
                        margin="normal"
                        variant="outlined"
                    />
                </Grid>

                <Grid item style={styles.submit.container}>
                    <CircularProgressButton
                        loading={this.state.isSubmitting}
                        onClick={this.handleSubmit}
                        variant="contained"
                        color="secondary"
                    >
                        Delete
                        <DeleteIcon />
                    </CircularProgressButton>
                </Grid>
            </React.Fragment>
        );
    }
}

const styles = {
    title: {
        container: {
            width: "100%",
        },
        inputField: {
            width: "100%",
        },
    },
    submit: {
        container: {
            width: "100%",
        },
    },
};

DeleteConfirmation.propTypes = {
    onConfirm: PropTypes.func,
    toDelete: PropTypes.object,
};

export default DeleteConfirmation;
