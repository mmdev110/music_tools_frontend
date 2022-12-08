import React, { useState, useEffect, useRef } from 'react'
import Dropzone from 'react-dropzone'

type Props = {
    audioFile: File | undefined
    audioUrl: string
    onDrop: (acceptedFiles: File[]) => void
}
const AudioPlayer = ({ audioFile, onDrop, audioUrl }: Props) => {
    const processFiles = (acceptedFiles: File[]) => {
        onDrop(acceptedFiles)
    }
    return (
        <div>
            <Dropzone accept={{ 'audio/mpeg': ['.mp3'] }} onDrop={processFiles}>
                {({ getRootProps, getInputProps }) => (
                    <section>
                        <div
                            className="border-2 border-solid border-sky-400"
                            {...getRootProps()}
                        >
                            Drag and Drop mp3
                            <input {...getInputProps()} />
                            <audio controls src={audioUrl} loop={true} />
                        </div>
                    </section>
                )}
            </Dropzone>
        </div>
    )
}
export default AudioPlayer
