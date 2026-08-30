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


/* VIDEO QO'SHISH */

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

            <div class="action">
                ↗️
                <span>Ulashish</span>
            </div>

        </div>
    `;

    box.dataset.id = item.id;


    /* LIKE */

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


    /* KOMMENT */

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


    feed.appendChild(box);


    loadCommentCount(
        box.dataset.id,
        commentButton
    );
}


/* KOMMENT SONI */

async function loadCommentCount(
    videoId,
    button
) {

    try {

        const response =
            await fetch(
                SUPABASE_URL +
                "/rest/v1/comments?select=id&video_id=eq." +
                videoId,
                {
                    headers: {
                        "apikey":
                            SUPABASE_KEY,

                        "Authorization":
                            "Bearer " +
                            SUPABASE_KEY,

                        "Prefer":
                            "count=exact"
                    }
                }
            );


        if (!response.ok) {
            return;
        }


        const range =
            response.headers.get(
                "content-range"
            );


        if (range) {

            const total =
                range.split("/")[1];

            if (total !== "*") {

                button.querySelector(
                    "span"
                ).innerText =
                    total;

            }

        }

    } catch (error) {

        console.log(
            "Komment soni xatosi:",
            error
        );

    }
}


/* KOMMENT OYNASI */

async function openComments(
    videoId,
    commentButton
) {

    const old =
        document.getElementById(
            "commentsModal"
        );

    if (old) {
        old.remove();
    }


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "commentsModal";


    modal.style.position =
        "fixed";

    modal.style.left = "0";
    modal.style.right = "0";
    modal.style.bottom = "0";

    modal.style.height =
        "70%";

    modal.style.background =
        "#111";

    modal.style.color =
        "#fff";

    modal.style.zIndex =
        "100000";

    modal.style.borderRadius =
        "20px 20px 0 0";

    modal.style.display =
        "flex";

    modal.style.flexDirection =
        "column";


    modal.innerHTML = `

        <div style="
            padding:15px;
            text-align:center;
            border-bottom:1px solid #333;
            font-weight:bold;
            position:relative;
        ">

            💬 Kommentlar

            <button
                id="closeComments"
                style="
                    position:absolute;
                    right:15px;
                    top:10px;
                    border:0;
                    background:none;
                    color:white;
                    font-size:25px;
                "
            >
                ×
            </button>

        </div>


        <div
            id="commentsList"
            style="
                flex:1;
                overflow-y:auto;
                padding:15px;
            "
        >
            Yuklanmoqda...
        </div>


        <div style="
            display:flex;
            gap:8px;
            padding:10px;
            border-top:1px solid #333;
        ">

            <input
                id="commentInput"
                type="text"
                maxlength="500"
                placeholder="Komment yozing..."
                style="
                    flex:1;
                    padding:12px;
                    border-radius:20px;
                    border:1px solid #444;
                    background:#222;
                    color:white;
                    outline:none;
                "
            >

            <button
                id="sendComment"
                style="
                    border:0;
                    border-radius:20px;
                    padding:0 18px;
                    background:white;
                    color:black;
                    font-weight:bold;
                "
            >
                Yuborish
            </button>

        </div>
    `;


    document.body.appendChild(
        modal
    );


    document
        .getElementById(
            "closeComments"
        )
        .addEventListener(
            "click",
            function() {

                modal.remove();

            }
        );


    const input =
        document.getElementById(
            "commentInput"
        );

    const send =
        document.getElementById(
            "sendComment"
        );


    send.addEventListener(
        "click",
        async function() {

            const text =
                input.value.trim();


            if (!text) {
                return;
            }


            send.disabled =
                true;

            send.innerText =
                "Yuborilmoqda...";


            const response =
                await fetch(
                    SUPABASE_URL +
                    "/rest/v1/comments",
                    {
                        method: "POST",

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
                                video_id:
                                    Number(
                                        videoId
                                    ),

                                comment_text:
                                    text
                            })
                    }
                );


            if (!response.ok) {

                alert(
                    "Komment yuborilmadi ❌"
                );

                console.log(
                    await response.text()
                );

            } else {

                input.value = "";

                await loadComments(
                    videoId
                );

                await loadCommentCount(
                    videoId,
                    commentButton
                );

            }


            send.disabled =
                false;

            send.innerText =
                "Yuborish";

        }
    );


    input.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key === "Enter"
            ) {

                send.click();

            }

        }
    );


    await loadComments(
        videoId
    );
}


/* KOMMENTLARNI YUKLASH */

async function loadComments(
    videoId
) {

    const list =
        document.getElementById(
            "commentsList"
        );


    if (!list) {
        return;
    }


    try {

        const response =
            await fetch(
                SUPABASE_URL +
                "/rest/v1/comments?select=id,comment_text,created_at&video_id=eq." +
                videoId +
                "&order=created_at.asc",
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

            list.innerText =
                "Kommentlarni yuklab bo‘lmadi.";

            console.log(
                await response.text()
            );

            return;

        }


        const comments =
            await response.json();


        if (
            comments.length === 0
        ) {

            list.innerHTML = `
                <div style="
                    text-align:center;
                    color:#888;
                    padding:30px;
                ">
                    Hali komment yo‘q.
                    <br>
                    Birinchi bo‘lib yozing! 💬
                </div>
            `;

            return;

        }


        list.innerHTML = "";


        comments.forEach(
            function(comment) {

                const item =
                    document.createElement(
                        "div"
                    );


                item.style.padding =
                    "10px 0";

                item.style.borderBottom =
                    "1px solid #222";


                item.innerHTML = `
                    <div style="
                        font-weight:bold;
                        margin-bottom:5px;
                    ">
                        👤 Foydalanuvchi
                    </div>

                    <div style="
                        color:#ddd;
                        word-break:break-word;
                    ">
                        ${escapeHTML(
                            comment.comment_text
                        )}
                    </div>
                `;


                list.appendChild(
                    item
                );

            }
        );


        list.scrollTop =
            list.scrollHeight;


    } catch (error) {

        console.log(
            "Komment xatosi:",
            error
        );

    }
}


/* XAVFSIZ MATN */

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        text;

    return div.innerHTML;
}


/* VIDEOLARNI YUKLASH */

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


/* VIDEO ALMASHTIRISH */

function showVideo(index) {

    const videos =
        getVideos();


    if (
        index < 0 ||
        index >= videos.length
    ) {

        return;

    }


    videos.forEach(
        function(box) {

            box.classList.remove(
                "active"
            );


            const video =
                box.querySelector(
                    "video"
                );


            if (video) {

                video.pause();

            }

        }
    );


    current = index;


    const box =
        videos[current];


    box.classList.add(
        "active"
    );


    const video =
        box.querySelector(
            "video"
        );


    if (video) {

        video.currentTime = 0;

    }

}


/* SURISH */

document.addEventListener(
    "touchstart",
    function(event) {

        if (
            event.target.closest(
                "#commentsModal"
            )
        ) {

            return;

        }


        startY =
            event.touches[0].clientY;

    }
);


document.addEventListener(
    "touchend",
    function(event) {

        if (
            event.target.closest(
                "#commentsModal"
            )
        ) {

            return;

        }


        const endY =
            event.changedTouches[0].clientY;


        const distance =
            startY - endY;


        if (
            Math.abs(distance) < 60
        ) {

            return;

        }


        if (
            distance > 0
        ) {

            showVideo(
                current + 1
            );

        } else {

            showVideo(
                current - 1
            );

        }

    }
);


/* VIDEO YUKLASH */

picker.addEventListener(
    "change",
    function() {

        const file =
            picker.files[0];


        if (!file) {

            return;

        }


        if (
            !file.type.startsWith(
                "video/"
            )
        ) {

            alert(
                "Faqat video tanlang!"
            );

            picker.value = "";

            return;

        }


        const fileName =
            Date.now() +
            "_" +
            Math.random()
                .toString(36)
                .substring(2) +
            "_" +
            file.name.replace(
                /[^a-zA-Z0-9._-]/g,
                "_"
            );


        const uploadURL =
            SUPABASE_URL +
            "/storage/v1/object/Videos/" +
            fileName;


        const progress =
            document.createElement(
                "div"
            );


        progress.style.position =
            "fixed";

        progress.style.top =
            "50%";

        progress.style.left =
            "50%";

        progress.style.transform =
            "translate(-50%, -50%)";

        progress.style.background =
            "#111";

        progress.style.color =
            "#fff";

        progress.style.padding =
            "20px 30px";

        progress.style.borderRadius =
            "15px";

        progress.style.zIndex =
            "99999";


        progress.innerText =
            "Yuklanmoqda: 0%";


        document.body.appendChild(
            progress
        );


        const xhr =
            new XMLHttpRequest();


        xhr.open(
            "POST",
            uploadURL,
            true
        );


        xhr.setRequestHeader(
            "Authorization",
            "Bearer " +
            SUPABASE_KEY
        );


        xhr.setRequestHeader(
            "apikey",
            SUPABASE_KEY
        );


        xhr.setRequestHeader(
            "Content-Type",
            file.type
        );


        xhr.setRequestHeader(
            "x-upsert",
            "false"
        );


        xhr.upload.onprogress =
            function(event) {

                if (
                    event.lengthComputable
                ) {

                    const percent =
                        Math.round(
                            event.loaded /
                            event.total *
                            100
                        );


                    progress.innerText =
                        "Yuklanmoqda: " +
                        percent +
                        "%";

                }

            };


        xhr.onload =
            async function() {

                if (
                    xhr.status >= 200 &&
                    xhr.status < 300
                ) {


                    const publicURL =
                        SUPABASE_URL +
                        "/storage/v1/object/public/Videos/" +
                        fileName;


                    progress.innerText =
                        "Saqlanmoqda...";


                    const dbResponse =
                        await fetch(
                            SUPABASE_URL +
                            "/rest/v1/videos",
                            {
                                method: "POST",

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
                                 
