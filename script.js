let current = 0;
let startY = 0;

const feed = document.getElementById("feed");
const picker = document.getElementById("videoPicker");


function getVideos(){

    return document.querySelectorAll(".video");

}


function showVideo(index){

    const videos = getVideos();

    if(index < 0 || index >= videos.length){

        return;

    }


    videos.forEach(function(item){

        item.classList.remove("active");

        const video = item.querySelector("video");

        if(video){

            video.pause();

        }

    });


    current = index;

    const box = videos[current];

    box.classList.add("active");


    const video = box.querySelector("video");

    if(video){

        video.currentTime = 0;

        video.play().catch(function(){});

    }

}


document.addEventListener("touchstart", function(event){

    startY = event.touches[0].clientY;

});


document.addEventListener("touchend", function(event){

    const endY = event.changedTouches[0].clientY;

    const distance = startY - endY;


    if(Math.abs(distance) < 60){

        return;

    }


    if(distance > 0){

        showVideo(current + 1);

    }else{

        showVideo(current - 1);

    }

});


picker.addEventListener("change", function(){

    const file = this.files[0];

    if(!file){

        return;

    }


    if(!file.type.startsWith("video/")){

        alert("Faqat video tanlang!");

        return;

    }


    const videoURL = URL.createObjectURL(file);


    const box = document.createElement("div");

    box.className = "video";


    box.innerHTML = `

        <video
            src="${videoURL}"
            muted
            loop
            playsinline>
        </video>


        <div class="info">

            <div class="username">
                @video_uz
            </div>

            <div class="caption">
                Yangi video 🎬
            </div>

        </div>


        <div class="actions">

            <div class="action">
                ❤️
                <span>0</span>
            </div>

            <div class="action">
                💬
                <span>0</span>
            </div>

            <div class="action">
                ↗️
                <span>Ulashish</span>
            </div>

        </div>

    `;


    feed.appendChild(box);


    const videos = getVideos();

    showVideo(videos.length - 1);


    picker.value = "";

});
