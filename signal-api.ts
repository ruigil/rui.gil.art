import { config } from "https://deno.land/x/dotenv/mod.ts";

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

for (const message of messages) {
    console.log(message)
    console.log(message.envelope.syncMessage?.sentMessage?.attachments)
    if (message.envelope.syncMessage?.sentMessage?.groupInfo?.groupId === oceanosGroupId) {
        console.log("OceanOS group found")

        // Check if message is a delete message
        if (message.envelope.syncMessage.sentMessage.remoteDelete) {
            console.log(`Message ${message.envelope.syncMessage.sentMessage.remoteDelete.timestamp} deleted`)
        } else {
            const date = new Date(message.envelope.syncMessage.sentMessage.timestamp)
            const post = {
                author: message.envelope.sourceName,
                time: date.getTime(),
                avatar: `/media/signal/avatars/profile-${message.envelope.sourceNumber}`,
                tags: <any>[]
            }

            post.tags.push(date.getFullYear())
            post.tags.push( months[date.getMonth()] )

            const text = message.envelope.syncMessage.sentMessage.message
            if (text) {
                Object.assign(post,{ message: text });
                post.tags.push("TEXT")
            }
            
            const image = message.envelope.syncMessage.sentMessage.attachments
            if (image) {
                Object.assign(post,{ image: `/media/signal/attachments/${image[0].id}` });
                post.tags.push("PHOTO")
            }
    
            posts.unshift({
                id: post.time,
                tags: post.tags,
            })

            await Deno.writeTextFile(`./messages/message-${post.time}.json`, JSON.stringify(post, null, 4))
   
        }
    } else if (message.envelope.syncMessage) {
        // a sync message without a sent message is interpreted as a profile config message.
        // so we copy the profile avatar to the profile folder
    }
}

if (posts.length != nPosts) { // inserted or deleted
    console.log("Posts updated")
    await Deno.writeTextFile('./messages/messages.json', JSON.stringify(posts, null, 4))
}
