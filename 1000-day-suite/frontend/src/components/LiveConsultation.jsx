import { useEffect, useRef, useState } from 'react'
import * as faceapi from '@vladmandic/face-api'

export default function LiveConsultation({ user, onClose }) {
    const videoRef = useRef(null)
    const [isModelsLoaded, setIsModelsLoaded] = useState(false)
    const [emotion, setEmotion] = useState('Initializing...')
    const [stream, setStream] = useState(null)
    const intervalRef = useRef(null)

    useEffect(() => {
        async function loadModels() {
            try {
                // Load tiny face detector and emotion models from JSdelivr CDN
                const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/'
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
                ])
                setIsModelsLoaded(true)
                setEmotion('Waiting for face...')
            } catch (err) {
                setEmotion('Failed to load AI models')
                console.error(err)
            }
        }
        loadModels()
    }, [])

    useEffect(() => {
        async function startVideo() {
            if (isModelsLoaded && navigator.mediaDevices.getUserMedia) {
                try {
                    const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true })
                    if (videoRef.current) {
                        videoRef.current.srcObject = mediaStream
                        setStream(mediaStream)
                    }
                } catch (err) {
                    setEmotion('Camera access denied')
                    console.error(err)
                }
            }
        }
        startVideo()

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop())
            }
            clearInterval(intervalRef.current)
        }
    }, [isModelsLoaded]) // Only run once models are loaded

    const handleVideoPlay = () => {
        intervalRef.current = setInterval(async () => {
            if (videoRef.current && isModelsLoaded) {
                const detections = await faceapi.detectAllFaces(
                    videoRef.current,
                    new faceapi.TinyFaceDetectorOptions()
                ).withFaceExpressions()

                if (detections && detections.length > 0) {
                    // Get the highest probability emotion from the first detected face
                    const expressions = detections[0].expressions
                    const dominantEmotion = Object.keys(expressions).reduce((a, b) => expressions[a] > expressions[b] ? a : b)

                    let emoji = '😐'
                    if (dominantEmotion === 'happy') emoji = '😊'
                    if (dominantEmotion === 'sad') emoji = '😢'
                    if (dominantEmotion === 'angry') emoji = '😠'
                    if (dominantEmotion === 'fearful') emoji = '😨'
                    if (dominantEmotion === 'disgusted') emoji = '🤢'
                    if (dominantEmotion === 'surprised') emoji = '😲'

                    setEmotion(`${dominantEmotion.charAt(0).toUpperCase() + dominantEmotion.slice(1)} ${emoji}`)
                } else {
                    setEmotion('No face detected')
                }
            }
        }, 1000) // Run every 1 second to save CPU
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: 800, width: '90%' }}>
                <button className="modal-close" onClick={onClose}>×</button>
                <h2 style={{ marginBottom: 8 }}>Live Consultation — Dr. Priya Sharma</h2>
                <p style={{ color: 'var(--ink-light)', marginBottom: 20 }}>Secure Video Room • E2E Encrypted</p>

                <div style={{ position: 'relative', width: '100%', background: '#000', borderRadius: 16, overflow: 'hidden', aspectRatio: '16/9' }}>
                    <video
                        ref={videoRef}
                        onPlay={handleVideoPlay}
                        autoPlay
                        muted
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />

                    {/* Emotion Telemetry Overlay */}
                    <div style={{
                        position: 'absolute',
                        bottom: 20,
                        left: 20,
                        background: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: 20,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        backdropFilter: 'blur(4px)',
                        border: '1px solid rgba(255,255,255,0.2)'
                    }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: isModelsLoaded ? '#4CAF50' : '#FFC107', animation: isModelsLoaded ? 'pulse 2s infinite' : 'none' }}></span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                            AI Telemetry: {emotion}
                        </span>
                    </div>

                    {!isModelsLoaded && (
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'white', background: 'rgba(0,0,0,0.8)', padding: '10px 20px', borderRadius: 8 }}>
                            Downloading Neural Models...
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 24 }}>
                    <button className="btn-secondary" style={{ borderRadius: '50%', width: 50, height: 50, padding: 0 }}>🎤</button>
                    <button className="btn-secondary" style={{ borderRadius: '50%', width: 50, height: 50, padding: 0 }}>📹</button>
                    <button className="btn-primary" style={{ background: '#E85454', borderRadius: '50%', width: 50, height: 50, padding: 0 }} onClick={onClose}>
                        <span style={{ filter: 'brightness(0) invert(1)' }}>📞</span>
                    </button>
                </div>
            </div>
        </div>
    )
}
