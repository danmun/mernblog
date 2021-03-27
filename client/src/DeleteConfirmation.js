import React from "react";
import Grid from '@material-ui/core/Grid';
import {TextField} from "@material-ui/core";
import Button from '@material-ui/core/Button';
import DeleteIcon from '@material-ui/icons/Delete';
import {deletePost} from "./api/posts";

class DeleteConfirmation extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            title: "",
            doDelete: false,
        }

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(post){
        let that = this
        // TODO: normalise the getter for the post ID (in this class we use ._id but in PostManager we use .id ...)
        deletePost(post).then(json => {
            // maybe best to check if json.status === 200 etc...
            that.props.onConfirm(post)
        })
    }
    
    render(){
        return(
            <React.Fragment>
                <Grid item style={{width: "100%"}}>
                    <TextField
                        disabled
                        style={{width: "100%"}}
                        id="outlined-disabled"
                        label="Title"
                        defaultValue={this.props.toDelete.title}
                        margin="normal"
                        variant="outlined"
                    />
                </Grid>

                <Grid item style={{width: "100%"}}>
                    <Button onClick={() => this.handleSubmit(this.props.toDelete)} variant="contained" color="secondary" style={{width: "100%"}}>
                        Delete
                        <DeleteIcon/>
                    </Button>
                </Grid>
            </React.Fragment>
        );
    }
}

export default DeleteConfirmation;
