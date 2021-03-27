import React, {useState, useEffect} from 'react';
import Post from './Post'
import PostManager from './PostManager'
import AdminModal from "./AdminModal";
import IconButton from '@material-ui/core/IconButton';
import AddPostIcon from '@material-ui/icons/AddCircle';
import Spinner from "./Spinner";
import {editAbout, fetchAbout, newAbout} from "./api/about";

function About(props) {
    let isAdmin = props.isAdmin

    const [modal, setModal] = useState({
        open: false,
        title: "Add an About section",
        editingPost: null
    })

    const [about, setAbout] = useState({
        loading: true,
        post: null,
    })

    useEffect(() => {
        fetchAbout().then(json => {
            setAbout({
                loading: false,
                post: json.about
            })
        })
    },[])

    let onDone = function(post){
        console.log("got here")
        if(post.id === null || post.id.trim().length === 0){
            submitNewAbout(post, setAbout)
        }else{
            submitEditedAbout(post, setAbout)
        }
        setModal({open: false})
    }

    return (
        <React.Fragment>
            {about.loading ? <Spinner/> : showAbout(isAdmin, about, modal, setModal)}

            {(isAdmin && !about.loading && !about.post) && showAdminUI(about, modal, setModal)}

            <div>
                <AdminModal title={modal.title} open={modal.open} dispose={() => setModal({open: false})}>
                    <PostManager onDone={onDone} editingPost={modal.editingPost}/>
                </AdminModal>
            </div>

        </React.Fragment>
    );
}

function showAdminUI(about, modal, setModal){
    return(
        <div style={{textAlign: "center"}}>
            <IconButton
                aria-label="open drawer"
                edge="start"
                onClick={() => openPostManager(about, modal, setModal)}
                style={{color: "green"}}
            >
                <AddPostIcon/>
            </IconButton>
        </div>
    )
}

function showAbout(isAdmin, about, modal, setModal){
    if(!about.post){
        return(
            <React.Fragment>
                <div style={{textAlign: "center"}}>
                    {"Content for the 'About' page does not exist yet."}
                </div>
            </React.Fragment>
        )
    }else{
        let onEdit = isAdmin ? () => openPostManager(about, modal, setModal) : null
        return(
            <React.Fragment>
                <Post onEdit={onEdit} post={about.post}/>
            </React.Fragment>
        )
    }
}

function submitNewAbout(post, setAbout){
    newAbout(post).then(json => {
        setAbout({post: json.about})
    })
}

function submitEditedAbout(post, setAbout){
    editAbout(post).then(json => {
        setAbout({post: json.about})
    })
}

function openPostManager(about, modal, setModal){
    setModal({
        ... modal,
        editingPost: about.post,
        open: true
    })
}

export default About;