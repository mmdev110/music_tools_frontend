import React, { useState, useEffect, useRef } from 'react'
import Dropzone from 'react-dropzone'

type Props = {
    audioFile: File | undefined
    onDrop: (acceptedFiles: File[]) => void
}
const AudioPlayer = ({ audioFile, onDrop }: Props) => {
    const processFiles = (acceptedFiles: File[]) => {
        onDrop(acceptedFiles)
    }
    return (
        <div>
            <Dropzone accept={{ 'audio/mpeg': ['.mp3'] }} onDrop={processFiles}>
                {({ getRootProps, getInputProps }) => (
                    <section>
                        <div style={{ border: 'solid' }} {...getRootProps()}>
                            <input {...getInputProps()} />
                            <audio
                                controls
                                src={
                                    audioFile && URL.createObjectURL(audioFile)
                                }
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
