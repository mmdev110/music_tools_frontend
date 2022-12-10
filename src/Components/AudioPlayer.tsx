import React, { useState, useEffect, useRef } from 'react'
import Dropzone from 'react-dropzone'
import HLS from 'hls.js'

type Props = {
    audioFile: File | undefined
    audioUrl: string
    onDrop: (acceptedFiles: File[]) => void
}
const test =
    'https://music-tools-local2.s3.ap-northeast-1.amazonaws.com/11/Glitchedtones+-+Chillout+Waves+(Demosong)_hls.m3u8'
const AudioPlayer = ({ audioFile, onDrop, audioUrl }: Props) => {
    const processFiles = (acceptedFiles: File[]) => {
        onDrop(acceptedFiles)
    }
    const audioRef = useRef<HTMLMediaElement>(null)
    useEffect(() => {
        if (HLS.isSupported()) {
            const hls = new HLS()
            hls.loadSource(test)
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
                            <div>
                                {audioFile
                                    ? audioFile.name
                                    : 'Drag and Drop mp3'}
                            </div>
                            <input {...getInputProps()} />
                            <audio
                                ref={audioRef}
                                controls
                                src={audioUrl}
                                loop={true}
                            />
                        </div>
                    </section>
                )}
            </Dropzone>
        </div>
    )
}
export default AudioPlayer
