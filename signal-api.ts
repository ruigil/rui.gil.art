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
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
for (const message of messages) {
    console.log(message)
    if (message.envelope.syncMessage?.sentMessage?.groupInfo?.groupId === oceanosGroupId) {
        console.log("OceanOS group found")
        console.log(message.envelope.syncMessage.sentMessage.groupInfo)

        // Check if message is a delete message
        if (message.envelope.syncMessage.sentMessage.remoteDelete) {
            console.log(`Message ${message.envelope.syncMessage.sentMessage.remoteDelete.timestamp} deleted`)
        } else {
            const date = new Date(message.envelope.syncMessage.sentMessage.timestamp)

            const tags = []
            tags.push(date.getFullYear())
            tags.push( months[date.getMonth()] )

            const text = message.envelope.syncMessage.sentMessage.message
            if (text) tags.push("TEXT")
            
            const image = message.envelope.syncMessage.sentMessage.attachments
            if (image) tags.push("PHOTO")

            const post = {
                author: message.envelope.sourceName,
                time: date.getTime(),
                message: text,
                tags: tags,
            }
    
            posts.unshift({
                id: post.time,
                tags: post.tags,
            })

            await Deno.writeTextFile(`./messages/message-${post.time}.json`, JSON.stringify(post, null, 4))
   
        }
    }
}

if (posts.length != nPosts) { // inserted or deleted
    console.log("Posts updated")
    await Deno.writeTextFile('./messages/messages.json', JSON.stringify(posts, null, 4))
}


/*
[
    { "name": "Cyber 2.0", 
        "id": "group.QnkrUHY5V2NIYXIvZjFPYTU0YmpidDQ4T1liR0RJUnRTWEorUlFPYURhUT0=", 
        "internal_id": "By+Pv9WcHar/f1Oa54bjbt48OYbGDIRtSXJ+RQOaDaQ=", 
        "members": ["+41786266872", "+41793088849", "+41762189620", "+41763730817", "+41796119092", "+41765006375", "+41796132808", "+41787177186", "+41797976966", "+41795278804", "", "", "+41782642501", "+41799410591", "", "+41792423940", "+41788958062"], "blocked": false, "pending_invites": [], "pending_requests": [], "invite_link": "", "admins": ["+41795278804", ""] }, 
    { "name": "Sorties voile @Paudex", 
        "id": "group.bjdFanVWd3c4Zkxha05FYzhhTUw5WGpNTzROR01TS1d2WjRISzFueStIRT0=", 
        "internal_id": "n7EjuVww8fLakNEc8aML9XjMO4NGMSKWvZ4HK1ny+HE=", "members": ["+41762189620", "+41767537721", "+41786062872", "+41768220422", "+41767575988", "+41764325464"], "blocked": false, "pending_invites": [], "pending_requests": [], "invite_link": "", "admins": ["+41764325464"] }, 
    { "name": "Cadeau départ Philippe W.", 
        "id": "group.V24xTW96ays2UGVIa3BjSnhFb0JPeGlRb3FPMkhNdjltZVpYcnM0UCtHRT0=", "internal_id": "Wn1Mozk+6PeHkpcJxEoBOxiQoqO2HMv9meZXrs4P+GE=", "members": ["+41797674814", "+41787177186", "+41795278804", "+41793088849", "", "+41762189620", "", "+41763730817", "+41796119092", "+41799410591", "+41788958062"], "blocked": false, "pending_invites": [], "pending_requests": [], "invite_link": "", "admins": ["+41763730817"] }, 
    { "name": "OceanOS", 
        "id": "group.K3JaRStVbE5jbXdMYjF4UlpkbDVmM25GbmJIdzcrVHY5dmZRRlVPYzVrQT0=", "internal_id": "+rZE+UlNcmwLb1xRZdl5f3nFnbHw7+Tv9vfQFUOc5kA=", "members": ["+41762189620"], "blocked": false, "pending_invites": [], "pending_requests": [], "invite_link": "", "admins": ["+41762189620"] }, 
    { "name": "Club des Architectes DGNSI", 
        "id": "group.TDA4MlRLVkt3UFhSdloyYURyMWhYaUZzYVdWTVBKS0lzL2FhTTE3c2ZBTT0=", "internal_id": "L082TKVKwPXRvZ2aDr1hXiFsaWVMPJKIs/aaM17sfAM=", "members": ["+41799410790", "+41796248111", "+41798085474", "+41762189620", "+41786160408", "+41796064309", "+41793210522", "+41786062872", "+41768220422", "+41798306960", "+41767575988", "+41764325464"], "blocked": false, "pending_invites": [], "pending_requests": [], "invite_link": "", "admins": ["+41799410790", "+41796248111", "+41798085474", "+41762189620", "+41786160408", "+41796064309", "+41793210522", "+41786062872", "+41768220422", "+41798306960", "+41767575988"] }, 
    { "name": "", "id": "group.S0NkOUhabzNsOTN0eEdIZE0xUjE1QT09", "internal_id": "KCd9HZo3l93txGHdM1R15A==", "members": [], "blocked": false, "pending_invites": [], "pending_requests": [], "invite_link": "", "admins": [] }
]
*/