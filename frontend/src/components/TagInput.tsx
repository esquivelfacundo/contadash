'use client'

import React, { useState, KeyboardEvent } from 'react'
import {
  Box,
  Chip,
  TextField,
  Paper,
  Typography,
} from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'

interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  label?: string
  placeholder?: string
  maxTags?: number
  maxLength?: number
  suggestions?: string[]
  error?: boolean
  helperText?: string
}

export default function TagInput({
  value = [],
  onChange,
  label = 'Tags',
  placeholder = 'Presiona Enter para agregar',
  maxTags = 20,
  maxLength = 50,
  suggestions = [],
  error = false,
  helperText,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault()
      addTag(inputValue.trim())
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      // Remove last tag on backspace if input is empty
      removeTag(value.length - 1)
    }
  }

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase()
    
    // Validations
    if (!trimmedTag) return
    if (value.length >= maxTags) {
      return
    }
    if (trimmedTag.length > maxLength) {
      return
    }
    if (value.includes(trimmedTag)) {
      setInputValue('')
      return
    }

    onChange([...value, trimmedTag])
    setInputValue('')
    setShowSuggestions(false)
  }

  const removeTag = (index: number) => {
    const newTags = value.filter((_, i) => i !== index)
    onChange(newTags)
  }

  const filteredSuggestions = suggestions.filter(
    (suggestion) =>
      !value.includes(suggestion) &&
      suggestion.toLowerCase().includes(inputValue.toLowerCase())
  )

  return (
    <Box>
      <TextField
        fullWidth
        label={label}
        placeholder={value.length < maxTags ? placeholder : `Máximo ${maxTags} tags`}
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value)
          setShowSuggestions(e.target.value.length > 0)
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => setShowSuggestions(inputValue.length > 0)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        disabled={value.length >= maxTags}
        error={error}
        helperText={
          helperText ||
          `${value.length}/${maxTags} tags (máx ${maxLength} caracteres cada uno)`
        }
        InputProps={{
          startAdornment: (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mr: 1 }}>
              {value.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  onDelete={() => removeTag(index)}
                  sx={{ maxWidth: 150 }}
                />
              ))}
            </Box>
          ),
        }}
      />

      {/* Suggestions dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            zIndex: 1000,
            mt: 0.5,
            maxHeight: 200,
            overflow: 'auto',
            width: '100%',
          }}
        >
          <Box sx={{ p: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
              Sugerencias:
            </Typography>
            {filteredSuggestions.slice(0, 10).map((suggestion, index) => (
              <Box
                key={index}
                onClick={() => addTag(suggestion)}
                sx={{
                  px: 2,
                  py: 1,
                  cursor: 'pointer',
                  borderRadius: 1,
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <Typography variant="body2">{suggestion}</Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      )}
    </Box>
  )
}
