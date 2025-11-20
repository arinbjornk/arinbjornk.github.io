class SquirclePainter {
    static get inputProperties() {
        return [
            '--squircle-radius',
            '--squircle-smooth',
            '--squircle-outline',
            '--squircle-fill',
            '--squircle-outline-width'
        ]
    }

    paint(ctx, geom, properties) {
        const radius = parseFloat(properties.get('--squircle-radius').toString()) || 20
        const smooth = parseFloat(properties.get('--squircle-smooth').toString()) || 1
        const outline = properties.get('--squircle-outline').toString().trim() || 'none'
        const fill = properties.get('--squircle-fill').toString().trim() || '#000'
        const outlineWidth = parseFloat(properties.get('--squircle-outline-width').toString()) || 0

        const width = geom.width
        const height = geom.height

        ctx.beginPath()

        // Superellipse formula: |x/a|^n + |y/b|^n = 1
        // We use n=4 for a standard "squircle" look which mimics iOS/macOS icons
        const n = 4

        // Resolution of the path
        const step = 2 * Math.PI / 360

        let first = true
        for (let t = 0; t < 2 * Math.PI; t += step) {
            const cosT = Math.cos(t)
            const sinT = Math.sin(t)

            // Parametric equations
            const x = (width / 2) * Math.sign(cosT) * Math.pow(Math.abs(cosT), 2 / n) + (width / 2)
            const y = (height / 2) * Math.sign(sinT) * Math.pow(Math.abs(sinT), 2 / n) + (height / 2)

            if (first) {
                ctx.moveTo(x, y)
                first = false
            } else {
                ctx.lineTo(x, y)
            }
        }
        ctx.closePath()

        // Draw fill
        if (fill !== 'none') {
            ctx.fillStyle = fill
            ctx.fill()
        }

        // Draw outline
        if (outline !== 'none' && outlineWidth > 0) {
            ctx.strokeStyle = outline
            ctx.lineWidth = outlineWidth
            ctx.stroke()
        }
    }
}

registerPaint('squircle', SquirclePainter)
