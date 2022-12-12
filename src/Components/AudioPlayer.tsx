import React, { useState, useEffect, useRef } from 'react'
import Dropzone from 'react-dropzone'
import HLS from 'hls.js'

type Props = {
    droppedFile: File | undefined
    audioUrl: string
    audioName: string
    onDrop: (acceptedFiles: File[]) => void
}
const AudioPlayer = ({ droppedFile, onDrop, audioUrl, audioName }: Props) => {
    const processFiles = (acceptedFiles: File[]) => {
        onDrop(acceptedFiles)
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
    return (
        <div>
            <Dropzone
                accept={{ 'audio/mpeg': ['.mp3', '.wav'] }}
                onDrop={processFiles}
            >
                {({ getRootProps, getInputProps }) => (
                    <section>
                        <div
                            className="border-2 border-solid border-sky-400"
                            {...getRootProps()}
                        >
                            <input {...getInputProps()} />
                            {droppedFile ? (
                                <div>
                                    <div>{droppedFile.name}</div>
                                    <audio
                                        controls
                                        src={URL.createObjectURL(droppedFile)}
                                        loop={true}
                                    />
                                </div>
                            ) : (
                                <div>
                                    <div>{audioName}</div>
                                    <audio
                                        ref={audioRef}
                                        controls
                                        loop={true}
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
