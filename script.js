const SUPABASE_URL =
"https://bbgruqvwkygjwqdocnsb.supabase.co";

const SUPABASE_KEY =
"sb_publishable_Aa5uSwt_KndueGLGEhGRSA_Z2qfJGat";

const BUCKET = "Videos";

const feed = document.getElementById("feed");
const picker = document.getElementById("videoPicker");

let current = 0;

// Videolarni yuklash
async function getVideos() {
    try {
        const response = await fetch(
            `${SUPABASE_URL}/storage/v1/object/list/${BUCKET}`,
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${SUPABASE_KEY}`,
                    "apikey": SUPABASE_KEY,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    prefix: "",
                    limit: 100,
                    offset: 0
                })
            }
        );

        if (!response.ok) return;

        const files = await response.json();

        feed.innerHTML = "";

        files
            .filter(file => file.name && /\.(mp4|mov|webm|m4v)$/i.test(file.name))
            .forEach(file => {
                addVideoToFeed(file.name);
            });

        showFirstVideo();

    } catch (error) {
        console.error("Videolarni olishda xato:", error);
    }
}


// Videoni feedga qo‘shish
function addVideoToFeed(fileName) {

    const videoBox = document.createElement("div");
    videoBox.className = "video";

    const video = document.createElement("video");

    video.src =
        `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${encodeURIComponent(fileName)}`;

    video.autoplay = false;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;

    videoBox.appendChild(video);

    feed.appendChild(videoBox);
}


// Birinchi videoni ko‘rsatish
function showFirstVideo() {

    const videos = document.querySelectorAll(".video");

    if (videos.length === 0) return;

    current = 0;

    videos.forEach((item, index) => {
        item.classList.toggle("active", index === 0);

        const video = item.querySelector("video");

        if (index === 0) {
            video.play().catch(() => {});
        } else {
            video.pause();
        }
    });
}


// VIDEO TANLASH
picker.addEventListener("change", async function () {

    const file = this.files[0];

    if (!file) return;

    // Faqat video
    if (!file.type.startsWith("video/")) {
        alert("Faqat video tanlang!");
        return;
    }

    // Yuklanmoqda oynasi
    const loading = document.createElement("div");

    loading.style.position = "fixed";
    loading.style.left = "50%";
    loading.style.top = "50%";
    loading.style.transform = "translate(-50%, -50%)";
    loading.style.zIndex = "9999";
    loading.style.background = "rgba(0,0,0,0.85)";
    loading.style.color = "white";
    loading.style.padding = "20px 30px";
    loading.style.borderRadius = "15px";
    loading.style.textAlign = "center";
    loading.style.fontSize = "18px";

    loading.innerHTML = `
        <div>Yuklanmoqda...</div>
        <div id="uploadPercent"
             style="font-size:30px;font-weight:bold;margin-top:8px;">
            0%
        </div>
    `;

    document.body.appendChild(loading);

    const percent = document.getElementById("uploadPercent");

    // Fayl nomi
    const fileName =
        `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

    try {

        // XMLHttpRequest foizni ko‘rsatish uchun
        const xhr = new XMLHttpRequest();

        xhr.open(
            "POST",
            `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${encodeURIComponent(fileName)}`
        );

        xhr.setRequestHeader(
            "Authorization",
            `Bearer ${SUPABASE_KEY}`
        );

        xhr.setRequestHeader(
            "apikey",
            SUPABASE_KEY
        );

        xhr.setRequestHeader(
            "Content-Type",
            file.type
        );

        xhr.upload.addEventListener("progress", function (event) {

            if (event.lengthComputable) {

                const value =
                    Math.round((event.loaded / event.total) * 100);

                percent.textContent = value + "%";
            }
        });


        xhr.onload = function () {

            if (xhr.status >= 200 && xhr.status < 300) {

                loading.innerHTML = `
                    <div style="font-size:30px;">✅</div>
                    <div>Yuklandi</div>
                `;

                // Biroz kutib oynani yopamiz
                setTimeout(() => {
                    loading.remove();

                    // Yangi videoni feedga qo‘shamiz
                    addVideoToFeed(fileName);

                    const allVideos =
                        document.querySelectorAll(".video");

                    allVideos.forEach((item, index) => {
                        item.classList.toggle(
                            "active",
                            index === allVideos.length - 1
                        );
                    });

                    const newVideo =
                        allVideos[allVideos.length - 1]
                            .querySelector("video");

                    newVideo.play().catch(() => {});

                }, 800);

            } else {

                loading.innerHTML = `
                    ❌ Yuklashda xatolik
                `;

                console.error(xhr.responseText);
            }
        };


        xhr.onerror = function () {

            loading.innerHTML = `
                ❌ Internet yoki server xatosi
            `;
        };


        xhr.send(file);

    } catch (error) {

        console.error(error);

        loading.innerHTML = `
            ❌ Xatolik yuz berdi
        `;
    }

    // Bir xil videoni yana tanlash imkoniyati
    picker.value = "";
});


// Boshlang‘ich videolarni yuklash
getVideos();
