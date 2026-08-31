let current = 0;
let startY = 0;

const feed = document.getElementById("feed");
const picker = document.getElementById("videoPicker");

const SUPABASE_URL =
"https://bbgruqvwkygjwqdocnsb.supabase.co";

const SUPABASE_KEY =
"sb_publishable_Aa5uSwt_KndueGLGEhGRSA_Z2qfJGat";


function getVideos() {
    return document.querySelectorAll(".video");
}


function addVideoToFeed(item) {

    const box = document.createElement("div");

    box.className = "video";

    const likes =
        item.likes === null ||
        item.likes === undefined
            ? 0
            : item.likes;


    box.innerHTML = `
        <video
            src="${item.videos_url}"
            controls
            playsinline
            preload="metadata">
        </video>

        <div class="info">
            <div class="username">@video_uz</div>
            <div class="caption">🎬 Video</div>
        </div>

        <div class="actions">

            <div class="action like-button">
                ❤️
                <span>${likes}</span>
            </div>

            <div class="action comment-button">
                💬
                <span>0</span>
            </div>

            <div class="action share-button">
                ↗️
                <span>Ulashish</span>
            </div>

        </div>
    `;


    box.dataset.id = item.id;


    const likeButton =
        box.querySelector(".like-button");


    likeButton.addEventListener(
        "click",
        async function(event) {

            event.stopPropagation();

            const videoId =
                box.dataset.id;

            const countElement =
                likeButton.querySelector("span");

            let currentLikes =
                Number(
                    countElement.innerText
                );

            currentLikes++;

            countElement.innerText =
                currentLikes;


            const response =
                await fetch(
                    SUPABASE_URL +
                    "/rest/v1/videos?id=eq." +
                    videoId,
                    {
                        method: "PATCH",

                        headers: {
                            "apikey":
                                SUPABASE_KEY,

                            "Authorization":
                                "Bearer " +
                                SUPABASE_KEY,

                            "Content-Type":
                                "application/json",

                            "Prefer":
                                "return=minimal"
                        },

                        body:
                            JSON.stringify({
                                likes:
                                    currentLikes
                            })
                    }
                );


            if (!response.ok) {

                currentLikes--;

                countElement.innerText =
                    currentLikes;

                console.log(
                    "Like xatosi:",
                    await response.text()
                );

            }

        }
    );


    const commentButton =
        box.querySelector(
            ".comment-button"
        );


    commentButton.addEventListener(
        "click",
        function(event) {

            event.stopPropagation();

            openComments(
                box.dataset.id,
                commentButton
            );

        }
    );


    const shareButton =
        box.querySelector(
            ".share-button"
        );


    shareButton.addEventListener(
        "click",
        function(event) {

            event.stopPropagation();

            const videoURL =
                item.videos_url;

            const telegramShareURL =
                "https://t.me/share/url?url=" +
                encodeURIComponent(
                    videoURL
                );

            window.open(
                telegramShareURL,
                "_blank"
            );

        }
    );


    feed.appendChild(box);
                    }
async function loadVideos() {

    try {

        const response =
            await fetch(
                SUPABASE_URL +
                "/rest/v1/videos?select=id,videos_url,likes",
                {
                    headers: {
                        "apikey":
                            SUPABASE_KEY,

                        "Authorization":
                            "Bearer " +
                            SUPABASE_KEY
                    }
                }
            );


        if (!response.ok) {

            alert(
                "Database xatosi: " +
                response.status
            );

            return;
        }


        const data =
            await response.json();


        data.forEach(
            function(item) {

                if (
                    item.videos_url
                ) {

                    addVideoToFeed(
                        item
                    );

                }

            }
        );


        if (
            getVideos().length > 0
        ) {

            showVideo(0);

        }


    } catch (error) {

        console.log(
            "Xato:",
            error
        );

    }

}



function openComments(
    videoId,
    commentButton
) {

    const oldModal =
        document.getElementById(
            "commentsModal"
        );


    if (oldModal) {
        oldModal.remove();
    }


    const modal =
        document.createElement("div");


    modal.id =
        "commentsModal";


    modal.style.position =
        "fixed";

    modal.style.left =
        "0";

    modal.style.right =
        "0";

    modal.style.bottom =
        "0";

    modal.style.height =
        "70%";

    modal.style.background =
        "#111";

    modal.style.color =
        "#fff";

    modal.style.zIndex =
        "99999";

    modal.style.borderRadius =
        "20px 20px 0 0";

    modal.style.padding =
        "15px";

    modal.style.boxSizing =
        "border-box";


    modal.innerHTML = `

        <div style="
            text-align:center;
            font-size:20px;
            font-weight:bold;
            margin-bottom:15px;
        ">
            💬 Kommentlar
        </div>

        <button id="closeComments" style="
            position:absolute;
            right:15px;
            top:10px;
            background:none;
            border:0;
            color:white;
            font-size:25px;
        ">
            ×
        </button>

        <div id="commentsList" style="
            height:calc(100% - 110px);
            overflow-y:auto;
        ">

            <div id="noComments"
                style="
                    text-align:center;
                    color:#888;
                    padding:30px;
                ">
                Hali komment yo‘q.
            </div>

        </div>

        <div style="
            position:absolute;
            bottom:10px;
            left:10px;
            right:10px;
            display:flex;
            gap:8px;
        ">

            <input
                id="commentInput"
                placeholder="Komment yozing..."
                style="
                    flex:1;
                    padding:12px;
                    border-radius:20px;
                    border:1px solid #555;
                    background:#222;
                    color:white;
                    outline:none;
                "
            >

            <button
                id="sendComment"
                style="
                    padding:10px 16px;
                    border:0;
                    border-radius:20px;
                "
            >
                Yuborish
            </button>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    const list =
        document.getElementById(
            "commentsList"
        );


    const input =
        document.getElementById(
            "commentInput"
        );


    const sendButton =
        document.getElementById(
            "sendComment"
        );


    function addComment(text) {
