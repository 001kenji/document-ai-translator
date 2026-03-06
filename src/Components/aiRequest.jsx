import { useState } from "react"


const convertGeminiToPollinationsFormat = (geminiMessages) => {
  return geminiMessages.map(msg => {
    // Flatten 'parts' array to one string
    const content = msg.parts.map(part => part.text).join(' ').trim()

    // Skip empty content
    if (!content) return null

    // Convert 'model' role to 'assistant'
    let role = msg.role === 'model' ? 'assistant' : msg.role

    // Pollinations does not support 'system' role → treat it as 'user' instruction
    if (msg.role === 'system') {
      role = 'user'
    }

    return {
      role,
      content
    }
  }).filter(Boolean) // remove nulls
}


  

const useGeminiTextGen = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  

  const generatePollinationAIText = async (prompt) => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gemini-2.5-flash',
          messages: prompt,
        }),
      })

      if (!res.ok) throw new Error(`API error: ${res.status}`)

      const data = await res.text()
      const content = data || ''
      // console.log('http content is :',content)
      return content // ← now returns content directly
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const generateText = async (messages) => {
    setLoading(true)
    setError(null)
// gemini-2.5-flash
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: messages, // must be formatted correctly below
          }),
        }
      )

      if (!res.ok){
        // fall back to pollination free api
        var pollinationFormat = convertGeminiToPollinationsFormat(messages)
        var result = await generatePollinationAIText(pollinationFormat)
        // console.log('☀️',result)
        return result
      }

      const data = await res.json()
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response'
    //   console.log('Gemini content:', content)
      return content
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, generateText }
}

export default useGeminiTextGen

//   export default usePollinationsTextGen
// pollination ai method
const usePollinationsTextGen = () => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
  
    const generateText = async (prompt) => {
      setLoading(true)
      setError(null)
  
      try {
        const res = await fetch('https://text.pollinations.ai/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: prompt,
          }),
        })
  
        if (!res.ok) throw new Error(`API error: ${res.status}`)
  
        const data = await res.text()
        const content = data || ''
        console.log('http content is :',content)
        return content // ← now returns content directly
      } catch (err) {
        setError(err.message)
        throw err
      } finally {
        setLoading(false)
      }
    }
  
    return { loading, error, generateText }
  }  