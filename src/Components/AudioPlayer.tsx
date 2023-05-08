import React, { useState, useEffect, useRef, SyntheticEvent } from 'react'
import Dropzone from 'react-dropzone'
import HLS from 'hls.js'
import { MediaRange } from 'types/front'

type Props = {
    droppedFile?: File | undefined
    audioUrl: string
    audioName?: string
    onDrop?: (acceptedFiles: File[]) => void
    dropDisabled: boolean
    mini: boolean
    autoPlay?: boolean
    isHLS: boolean
    range: MediaRange
}
const AudioPlayer = ({
    droppedFile,
    onDrop,
    audioUrl,
    audioName,
    dropDisabled,
    mini,
    autoPlay,
    isHLS,
    range,
}: Props) => {
    const processFiles = (acceptedFiles: File[]) => {
        if (onDrop) onDrop(acceptedFiles)
    }
    const audioRef = useRef<HTMLMediaElement>(null)
    useEffect(() => {
        if (HLS.isSupported()) {
            console.log(audioUrl)
            const hls = new HLS()
            hls.loadSource(audioUrl)
            hls.attachMedia(audioRef.current!)
        }
    }, [audioUrl])

    const [fileUrl, setFileUrl] = useState('')
    useEffect(() => {
        if (droppedFile) setFileUrl(URL.createObjectURL(droppedFile))
    }, [droppedFile])
    const timeupdatefunc = (event: SyntheticEvent<HTMLAudioElement>) => {
        const { start, end } = range
        if (event.target instanceof HTMLAudioElement && start > 0 && end > 0) {
            const currentTime = event.target.currentTime
            //console.log(currentTime)
            if (currentTime < start) {
                event.target.currentTime = start
            } else if (currentTime > end) {
                event.target.currentTime = start
            }
        }
    }
    return (
        <div>
            <Dropzone
                accept={{ 'audio/mpeg': ['.mp3', '.wav', '.m4a'] }}
                onDrop={processFiles}
                disabled={dropDisabled}
            >
                {({ getRootProps, getInputProps }) => (
                    <section>
                        <div
                            className="border-2 border-solid border-sky-400"
                            {...getRootProps()}
                        >
                            <input {...getInputProps()} />
                            <div>{audioName}</div>
                            {isHLS ? (
                                <div>
                                    <audio
                                        ref={audioRef}
                                        onTimeUpdate={timeupdatefunc}
                                        controls
                                        loop={true}
                                        autoPlay={autoPlay}
                                    />
                                </div>
                            ) : (
                                <div>
                                    <audio
                                        controls
                                        src={fileUrl}
                                        onTimeUpdate={timeupdatefunc}
                                        loop={true}
                                        autoPlay={true}
                                    />
                                </div>
                            )}
                        </div>
                    </section>
                )}
            </Dropzone>
        </div>
    )
}
export default AudioPlayer
