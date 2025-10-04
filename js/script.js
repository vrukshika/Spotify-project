let currentSong = new Audio();
let songs;
let currFolder;


function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`) //fetch returns a promise it is an async operation
    let response = await a.text();
    //console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    //console.log(as);
    songs = [];

    for (let i = 0; i < as.length; i++) {
        let element = as[i];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);  // return ['http://127.0.0.1:5500', 'By%20Myself.mp3'] we need the second part
        }
    }

    // console.log(songs);

    //show all songs in the playlist
    //add songs to the ul 
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")
    [0];

    songUL.innerHTML = ""; //clear the previous songs
    for (const song of songs) {
        songUL.innerHTML += `<li> <img src="img/music.svg" alt="" class="invert" > 
     <div class="info">
             <div>${song.replaceAll("%20", " ")}</div>
             <div>vrukshika</div>
         </div>
         <div class="playnow ">
             <span>play now</span>
             <img class="invert" src="img/play1.svg" alt="">
         </div>
     </li>`;
    }


    //attach event listener to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).
        forEach(e => {
            //console.log(el);
            e.addEventListener("click", element => {
                //console.log(e.querySelector(".info").children[0].innerHTML);
                playMusic(e.querySelector(".info").children[0].innerHTML.trim());
            });
        })

    return songs;

}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) { //by default pause is false
        currentSong.play();
        play.src = "img/pause.svg";
    }

    //display the song name and time on playbar
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";

}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");

    //console.log(anchors);
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        // Array.from(anchors).forEach(async e => {
        if (e.href.includes("/songs/")) {
            //console.log(a.href.split("/songs/")[1]);
            //let folder = e.href.split("/songs/")[1];
            let folder = e.href.split("/").slice(-1)[0]; // Get the folder name from the URL
            // console.log(folder);

            //fetch info.json file
            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();
           // console.log(response);
            cardContainer.innerHTML = cardContainer.innerHTML +
                ` <div data-folder="${folder}" class="card">
                <div class="play">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            xmlns="http://www.w3.org/2000/svg"> <path d="M5 20V4L19 12L5 20Z" 
            stroke="#141834" fill="#000" stroke-width="1.5" stroke-linecap="round" />
        </svg>
    </div>
    <img src="/songs/${folder}/cover.jpg" alt="">
    <h2>${response.title}</h2>
    <p>${response.description}</p>
</div>`
        }
    }


    //load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.
                folder}`);
            playMusic(songs[0],true); //play the first song and pause it
        })
    })
}


async function main() {

    //get list of all songs
    await getSongs("songs/ncs"); //wait until the promise is resolved
    //console.log(songs);

    playMusic(songs[0], true); //play the first song and pause it

    //display all the albums of the songs on page
    await displayAlbums();

    //attach event listener to play,next and prev button

    //play button
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    })

    //listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime);
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;

        //update circle position of song progress
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    //add event listener to seekbar
    //cursor position update
    document.querySelector(".seekbar").addEventListener("click", e => {
        //console.log(e.offsetX,e.offsetY);
        // console.log(e.target.getBoundingClientRect().width,e.offsetX);
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";  //% means we aplly it in % to left circle and we give left as 0% in css

        //update current time of song
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    //add eventlistener for hqambergur 
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    //add eventlistener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";

    });

    //add an event listener to prev button

    prev.addEventListener("click", () => {
        currentSong.pause();
       console.log("previous clicked");
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
         console.log(index);

        // Circular navigation for previous
        if ((index-1) >= 0) {
        playMusic(songs[index-1]);
        }
    });


    //add an event listener to next button
    next.addEventListener("click", () => {
        currentSong.pause();
        console.log("next clicked");
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        //console.log(songs, index);
        console.log(index);

        //for next
        if ((index+1)<songs.length ) {
        playMusic(songs[index+1]);
        }
    });

    //add an event listener on volume range
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    })

    //add event listener for mute volume
    document.querySelector(".volume  img").addEventListener("click", e => {
        //console.log(e.target);
        console.log("changing", e.target.src);

        if (e.target.src.includes("volume.svg")) {
            e.target.src = "img/mute.svg";
            currentSong.volume = 0;

            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
            
        } else {
            e.target.src = "img/volume.svg";
            currentSong.volume = 0.10;
            document.querySelector(".range").getElementsByTagName("input")[0].
                value = 10;
        }
    })

}


main();

