import { useState, useEffect } from 'react'

const Icon = (props: {
  filePath: string
  fillColor: string
  width: number
  height: number
}) => {
  const [svgContent, setSvgContent] = useState<string | null>(null)

  useEffect(() => {
    const fetchSvg = async () => {
      try {
        const response = await fetch(props.filePath)
        const svgText = await response.text()
        setSvgContent(svgText)
      } catch (error) {
        console.error('Error loading SVG:', error)
      }
    }

    fetchSvg()
  }, [props.filePath])

  if (!svgContent) {
    return null // SVG is not loaded yet
  }

  const customizedSvg = (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={props.width}
      height={props.height}
      style={{ fill: props.fillColor }}
    >
      <g dangerouslySetInnerHTML={{ __html: svgContent }} />
    </svg>
  )

  return customizedSvg
}

export default Icon
