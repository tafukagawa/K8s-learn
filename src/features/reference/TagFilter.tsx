import { Box, Chip } from '@mui/material'

interface TagFilterProps {
  allTags: string[]
  selectedTag: string | null
  onTagChange: (tag: string | null) => void
}

export function TagFilter({ allTags, selectedTag, onTagChange }: TagFilterProps) {
  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
      <Chip
        label="すべて"
        size="small"
        onClick={() => onTagChange(null)}
        color={selectedTag === null ? 'primary' : 'default'}
        sx={{ fontWeight: selectedTag === null ? 600 : 400 }}
      />
      {allTags.map(tag => (
        <Chip
          key={tag}
          label={tag}
          size="small"
          variant="outlined"
          onClick={() => onTagChange(tag === selectedTag ? null : tag)}
          color={selectedTag === tag ? 'primary' : 'default'}
        />
      ))}
    </Box>
  )
}
