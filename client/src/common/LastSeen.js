import { CircularProgress, Tooltip, Typography } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { fetchSeen } from "../api/seen";

const LAST_SEEN_LOCALSTORAGE_KEY = "lastSeen";
const LAST_SEEN_EXPIRY_LOCALSTORAGE_KEY = "lastSeenExpiresAt";
const GITHUB_RATE_LIMIT_SECONDS = 60;

function LastSeen(props) {
    const [seen, setSeen] = useState({});
    // Unfortunately, this useEffect will enter twice because the
    // sidebar is mounted twice (one hidden, one not - they switch based on device size i.e. responsiveness) -- I THINK
    // This is also evident if we place console.log here and our backend API which this hook calls.
    useEffect(() => {
        let lastSeen = localStorage.getItem(LAST_SEEN_LOCALSTORAGE_KEY);
        if (lastSeen) {
            const expiry = localStorage.getItem(
                LAST_SEEN_EXPIRY_LOCALSTORAGE_KEY
            );
            const now = Date.now() / 1000;
            // if last-seen was fetched less than a minute ago, don't call last-seen endpoint
            // because it will overload the github api rate limit
            if (expiry > now) {
                setSeen(JSON.parse(lastSeen));
                return;
            }
        }

        fetchSeen().then((json) => {
            if (json.error) {
                setSeen({ error: json.error });
            } else {
                // don't re-fetch the github last seen if it was fetched in the last 1 minute
                const expires =
                    Math.floor(Date.now() / 1000) + GITHUB_RATE_LIMIT_SECONDS;
                localStorage.setItem(
                    LAST_SEEN_LOCALSTORAGE_KEY,
                    JSON.stringify(json)
                );
                localStorage.setItem(
                    LAST_SEEN_EXPIRY_LOCALSTORAGE_KEY,
                    expires
                );
                setSeen(json);
            }
        });
    }, []);

    return (
        <React.Fragment>
            <Typography variant={"caption"} color="textSecondary">
                Last posted:{" "}
                {seen.lastPost ? (
                    createLastPostedElement(seen.lastPost)
                ) : (
                    <CircularProgress size={10} />
                )}
            </Typography>
            <br />
            <Typography variant={"caption"} color="textSecondary">
                Code updated:{" "}
                {seen.lastCommit ? (
                    createCodeUpdatedElement(seen.lastCommit)
                ) : (
                    <CircularProgress size={10} />
                )}
            </Typography>
        </React.Fragment>
    );
}

function createCodeUpdatedElement(lastCommit) {
    return (
        <Tooltip title={lastCommit.message}>
            <a target={"_blank"} style={styles.commitUrl} href={lastCommit.url}>
                {lastCommit.date}
            </a>
        </Tooltip>
    );
}

function createLastPostedElement(lastPosted) {
    return (
        <Tooltip title={lastPosted.title}>
            {/* NOTE: Tooltip requires a child element otherwise it will crash with className error https://github.com/mui-org/material-ui/issues/18119 */}
            <span>{lastPosted.date}</span>
        </Tooltip>
    );
}

const styles = {
    commitUrl: {
        color: "inherit",
        cursor: "alias",
    },
};

export default LastSeen;
