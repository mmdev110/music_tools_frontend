import React, { useState, useEffect, useRef, SyntheticEvent } from 'react'
import Dropzone from 'react-dropzone'
import HLS from 'hls.js'

interface Range {
    start: number
    end: number
}
type Props = {
    droppedFile?: File | undefined
    audioUrl: string
    audioName?: string
    onDrop?: (acceptedFiles: File[]) => void
    dropDisabled: boolean
    mini: boolean
    autoPlay?: boolean
    isHLS: boolean
    range: Range
    toggle: boolean
    onTimeUpdate?: (currentTime: number) => void
    onMetadataLoaded?: (event: any) => void
    className?: string
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
    toggle,
    onTimeUpdate,
    onMetadataLoaded,
    className,
}: Props) => {
    const processFiles = (acceptedFiles: File[]) => {
        if (onDrop) onDrop(acceptedFiles)
    }
    const audioRef = useRef<HTMLMediaElement>(null)

    //const audioRef = useRef<HTMLMediaElement>(null)
    useEffect(() => {
        if (HLS.isSupported()) {
            const hls = new HLS()
            hls.loadSource(audioUrl)
            if (audioRef) hls.attachMedia(audioRef.current!)
        }
    }, [audioUrl])

    useEffect(() => {
        if (audioRef.current) {
            if (toggle) {
                audioRef.current.play()
            } else {
                audioRef.current.pause()
            }
        }
    }, [toggle])
    const [fileUrl, setFileUrl] = useState('')
    useEffect(() => {
        if (droppedFile) setFileUrl(URL.createObjectURL(droppedFile))
    }, [droppedFile])
    const timeupdatefunc = (event: SyntheticEvent<HTMLAudioElement>) => {
        const { start, end } = range
        if (event.target instanceof HTMLAudioElement) {
            const currentTime = event.target.currentTime
            if (onTimeUpdate) onTimeUpdate(currentTime)
            if (start >= 0 && end > 0 && end - start > 0) {
                //console.log(currentTime)
                if (currentTime < start) {
                    event.target.currentTime = start
                } else if (currentTime > end) {
                    event.target.currentTime = start
                }
            }
        }
    }

    return (
        <div className={className}>
            <Dropzone
                accept={{ 'audio/mpeg': ['.mp3', '.wav', '.m4a'] }}
                onDrop={processFiles}
                disabled={dropDisabled}
            >
                {({ getRootProps, getInputProps }) => (
                    <section>
                        <div {...getRootProps()}>
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
                                        onLoadedMetadata={onMetadataLoaded}
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
                                        ref={audioRef}
                                        onLoadedMetadata={onMetadataLoaded}
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
