// The following posts have been shared either on Twitter or in private chats, so it's important
// that their ID-based URLs redirect to the new slug-based URL so that the backend doesn't throw a "Not found" error.
// No need to consider future posts as they wil not be shared by their ID-based link.
const PRE_SLUG_POSTS = {
    "630774a32455830018ec2071": "Hungary-trip",
    "62b695e44cf63300186809f4": "Okinawa-trip",
    "62a588ddb44df8001885181a": "AWS-Certified-Developer",
    "628bab952895bc0018e7b69b": "Golden-Week-2022-Tohoku-trip",
    "627653aa06d1cb001841eaae": "Rental-Properties-Japan-Yamagata",
    "6266d9164a5be20018d818a1": "Heroku-without-GitHub-deployments",
    "6239fb3a4612820018a670c9": "Tokyo-Disneyland",
    "621a11fc9bc7280018aa0328": "More-skiing-and-sightseeing-Yamagata-and-Sendai",
    "620133d179cc7800184f3ad3": "Skiing-in-Hakuba",
    "6203e02a7245a10018177fb2": "Blogging-consistently-is-harder-than-I-thought",
    "61ed07db40360100181cc82e": "COVID-and-international-travel-from-Japan",
    "61dbab8d2ab0b40018b3947c": "Targets-for-the-New-Year",
    "61965d7307de320018c4625f": "Cookieless-browsing-with-Cookie-Pirate.",
    "619fc2b1ba7ad60018ff973d": "Rent-an-IKEA-mini-apartment-in-Shin-Okubo-for-99-JPYmonth",
    "613a39184ec0f50018b77dad": "Shikoku-trip",
    "609a81161d75960017bb6811": "Cryptocurrency-research",
    "5dd3c8c4c0db060017e1a2a5": "(Failing-at)-Observing-momiji-at-Mt-Takao",
    "5db288bb8165820017ee8f23": "Extending-status-of-residence-a.k.a.-renewing-Japanese-visa-(part-1)",
    "5da99567f5bf190017b73dc5": "Trying-to-not-mix-M-UI-and-Bootstrap",
    "5db27d633d8aba0017e84761": "Mouldy-aircon"
}

const FRONTEND_POST_ROUTE = "/post/"

/**
 * Redirect old, ID-based article links to their new slug based URL.
 * e.g. redirect wanderingblog.net/post/630774a32455 to wanderingblog.net/post/trip-to-hungary
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
const redirectIdBasedLinks = async (req, res, next) => {
    // Reminder: will only enter on <host>/post/<id> not <host>/api/post?slug=<slug>
    if(req.url.startsWith(FRONTEND_POST_ROUTE)){
        const urlParts = req.url.split("/");
        const oldId = urlParts[urlParts.length - 1];
        const newSlug = PRE_SLUG_POSTS[oldId];
        if(newSlug) {
            const newUrl = `${FRONTEND_POST_ROUTE}${newSlug}`
            res.redirect(301, newUrl);
            return;
        }
    }
    next();
}

module.exports = redirectIdBasedLinks;