

const getMS = (time) => {
    const times = time.split(":", 3).map(Number)
    let seconds = 0;
    seconds += times[0] * 60 * 60;
    seconds += times[1] * 60;
    seconds += times[2];
    seconds *= 1000;


    return seconds;
}

const MS_ToF = (ms) => {
    let s = ms / 1000;
    let hours = Math.floor(s / 3600);
    let minutes = Math.floor((s % 3600) / 60)
    let seconds = Math.floor(s % 60)

    return ([hours, minutes, seconds].map(String).map(s => s.padStart(2, '0')).join(":"))
}

const Timer = (ms, signal) => {
    const startTime = performance.now();
    const TimeView = document.getElementById("TimeView")

    return new Promise ((resolve, reject) => {
        if (signal?.aborted) {
            return reject({message : "Something went wrong", time : 0})
        }

        const updater = setInterval(() => {
            TimeView.innerText = MS_ToF(Math.floor(performance.now() - startTime))
        }, 1000)

        const timer = setTimeout(() => {
            clearInterval(updater)
            resolve({message : "Time completed", time : ms})
        }, ms)

        signal?.addEventListener("abort", () => {
            clearTimeout(timer);
            clearInterval(updater)
            const endTime = performance.now()
            reject({message: "Timer stopped early!", time : Math.floor(endTime - startTime)}, {once : true})
        })

    })
}

const startTimer = (time) => {
    const ms = getMS(time);

    const controller = new AbortController();

    const prom = Timer(ms, controller.signal)
    return {controller: controller, promise : prom}
}


document.getElementById("testButton").addEventListener("click", () => {
    const time = document.getElementById("timeInput").value
    console.log(time)
    let timer = startTimer(time)
    const abort = document.getElementById("abortButton")

    abort.addEventListener("click", () => {
        timer.controller.abort()
    }, {once : true})

    timer.promise.then(revolve => console.log(revolve.message)).catch((err) => {
        console.log(err.message)
        console.log ("Elapsed time: " + MS_ToF(err.time))
    }).finally(() => {

    })
})