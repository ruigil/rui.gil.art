import { config } from "https://deno.land/x/dotenv/mod.ts";
import { test } from "lume/deps/front_matter.ts";

// Load environment variables
const env = config();

const oceanosGroupId = env.OCEANOS_GROUP_ID;
const apiUrl = env.API_URL;

if (!oceanosGroupId || !apiUrl) {
    console.error("Environment variables OCEANOS_GROUP_ID and API_URL must be set");
    Deno.exit(1);
}

const messages = await(await fetch(apiUrl)).json()
const posts = JSON.parse(await Deno.readTextFile('./messages/messages.json'))
const nPosts = posts.length
const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
let update = false;


for (const message of messages) {
    console.log(message)
    if (message.envelope.syncMessage?.sentMessage?.groupInfo?.groupId === oceanosGroupId) {
        console.log("OceanOS group found")
        update = true;

        // Check if message is a delete message
        if (message.envelope.syncMessage.sentMessage.remoteDelete) {
            const id = message.envelope.syncMessage.sentMessage.remoteDelete.timestamp;
            await Deno.remove(`./messages/message-${id}.json`)
            const indexToRemove = posts.findIndex((item:any) => item.id === id );
            if (indexToRemove !== -1) {
                posts.splice(indexToRemove, 1);
            }
            console.log(`Message ${id} deleted`)
        } else {
            const date = new Date(message.envelope.syncMessage.sentMessage.timestamp)
            const post = {
                author: message.envelope.sourceName,
                time: date.getTime(),
                avatar: `/media/signal/avatars/profile-${message.envelope.sourceNumber}`,
                tags: <any>[]
            }

            post.tags.push(date.getFullYear() + "")
            post.tags.push( months[date.getMonth()] )

            let text = message.envelope.syncMessage.sentMessage.message
            if (text) {
                const userTags = text.match(/#\w+/g);
                if (userTags) {
                    // remove the hasthag and convert to uppercase
                    post.tags.push(...userTags.map((tag:string) => tag.slice(1).toUpperCase()))
                }
                text = text.replace(/#\w+/g, "")
                if (text.trim().length > 0) {
                    Object.assign(post,{ message: text });
                    post.tags.push("TEXT")
                }
            }
            
            const media = message.envelope.syncMessage.sentMessage.attachments
            if (media) {
                console.log(media)
                if (["image/jpeg","image/png"].includes(media[0].contentType) ) {
                    const position = text.match(/https:\/\/maps\.google\.com\/maps[^\s]*/g);
                    if (position && position[0]) {
                        Object.assign(post,{ maps: [`/media/signal/attachments/${media[0].id}`, position[0]] });
                        Object.assign(post,{ message: text.replace(position[0], "") });
                        post.tags.push("POSITION")
                    } else {
                        Object.assign(post,{ image: `/media/signal/attachments/${media[0].id}` });
                        post.tags.push("PHOTO")
                    }
                        //https://maps.google.com/maps?q=40.81565294926757%2C-16.487109996378422
                } else if (["video/mp4"].includes(media[0].contentType)) {
                    Object.assign(post,{ video: `/media/signal/attachments/${media[0].id}` });
                    post.tags.push("VIDEO")
                } else if (["audio/acc","audio/mp4"].includes(media[0].contentType)) {
                    Object.assign(post,{ audio: `/media/signal/attachments/${media[0].id}` });
                    post.tags.push("AUDIO")
                }
            }
    
            posts.unshift({
                id: post.time,
                tags: post.tags,
            })

            await Deno.writeTextFile(`./messages/message-${post.time}.json`, JSON.stringify(post, null, 4))
        }
    }
}

if (update) { // inserted or deleted
    console.log("Posts updated")
    await Deno.writeTextFile('./messages/messages.json', JSON.stringify(posts, null, 4))
}
