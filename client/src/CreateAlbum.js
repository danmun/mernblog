import './style/editor.css'
import React from "react";
import Grid from '@material-ui/core/Grid';
import {TextField} from "@material-ui/core";
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';

class CreateAlbum extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            title: "", // textfield value
            tags: "", // textfield value
            description: "",
            images: []
        }

        this.hashtagOnBlur = this.hashtagOnBlur.bind(this);
        this.hashtagOnFocus = this.hashtagOnFocus.bind(this);
        this.hashtagOnType = this.hashtagOnType.bind(this);
        this.titleOnType = this.titleOnType.bind(this);
        this.descriptionOnType = this.descriptionOnType.bind(this);
        this.handleFileSelection = this.handleFileSelection.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    hashtagOnType(event){
        let text = event.target.value
        let currentChar = text[text.length - 1]
        let previousNonSpaceChar = text[text.length - 2]

        // if initial hashtag is deleted, field will be empty, append new initial hashtag if user starts typing
        if(this.state.tags === ""){
            this.setState({tags: "#" + text})
        }else if(currentChar === " " && previousNonSpaceChar === "#"){
            return
        }else if(text === " "){
            this.setState({tags: "#"})
        }else if(text.endsWith(" ")){
            this.setState({tags: text + "#"})
        }else{
            this.setState({tags: text})
        }

    }

    hashtagOnBlur (event){
        let text = event.target.value
        if(text.endsWith("#")){
            let newText = text.substr(0, text.length - 1).trim()
            this.setState({tags: newText})
        }
    }

    hashtagOnFocus(event){
        if(!this.state.tags.endsWith(" #")){
            let tag = "#"
            if(this.state.tags.length === 0){
                this.setState({tags: tag})
            }else{
                this.setState({tags: this.state.tags + " #"})
            }
        }
    }

    handleFileSelection(files){
        this.setState({images: files})
    }

    handleSubmit(){
        this.props.onCreate(this.state)
    }

    titleOnType(event){
        let text = event.target.value
        this.setState({title: text})
    }

    descriptionOnType(event){
        let text = event.target.value
        this.setState({description: text})
    }

    render(){
        let {title, description, tags} = this.state
        return(
            <React.Fragment>
                <Grid item style={{width: "100%"}}>
                    <TextField
                        style={{width: "100%"}}
                        id="outlined-with-placeholder"
                        label="Title"
                        value={title}
                        placeholder="Keep it short and catchy ..."
                        margin="normal"
                        variant="outlined"
                        inputProps={{maxLength: "120"}}
                        onChange={this.titleOnType}
                    />
                </Grid>

                <Grid item style={{width: "100%"}}>
                    <TextField
                        style={{width: "100%"}}
                        id="outlined-with-placeholder"
                        label="Description"
                        value={description}
                        placeholder="A few words about it ..."
                        margin="normal"
                        variant="outlined"
                        inputProps={{maxLength: "300"}}
                        onChange={this.descriptionOnType}
                    />
                </Grid>

                <Grid item style={{width: "100%", textAlign: "center", border: "1px solid lightgrey"}}>
                    <div style={{padding: "20px"}}>
                        <input onChange={(event) => this.handleFileSelection(event.target.files) } type={"file"} name="album" multiple/>
                    </div>
                </Grid>

                <Grid item style={{width: "100%"}}>
                    <TextField
                        style={{width: "100%"}}
                        id="outlined-with-placeholder"
                        label="#tags"
                        value={tags}
                        margin="normal"
                        variant="outlined"
                        inputProps={{maxLength: "120"}}
                        onChange={this.hashtagOnType}
                        onBlur={this.hashtagOnBlur}
                        onFocus={this.hashtagOnFocus}
                    />
                </Grid>

                <Grid item style={{width: "100%"}}>
                    <Button onClick={this.handleSubmit} variant="contained" color="primary" style={{width: "100%"}}>
                        Create
                        <Icon>send</Icon>
                    </Button>
                </Grid>
            </React.Fragment>
        );
    }
}

export default CreateAlbum;
