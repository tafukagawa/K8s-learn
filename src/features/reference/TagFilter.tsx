import { Select, MenuItem, FormControl, InputLabel } from '@mui/material'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'

interface TagFilterProps {
  allTags: string[]
  selectedTag: string | null
  onTagChange: (tag: string | null) => void
}

export function TagFilter({ allTags, selectedTag, onTagChange }: TagFilterProps) {
  return (
    <FormControl size="small" sx={{ minWidth: 180 }}>
      <InputLabel id="tag-filter-label" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <LocalOfferIcon sx={{ fontSize: 14 }} /> タグで絞り込み
      </InputLabel>
      <Select
        labelId="tag-filter-label"
        label="タグで絞り込み"
        value={selectedTag ?? ''}
        onChange={e => onTagChange(e.target.value === '' ? null : e.target.value)}
        sx={{ bgcolor: 'background.paper' }}
      >
        <MenuItem value="">すべて</MenuItem>
        {allTags.map(tag => (
          <MenuItem key={tag} value={tag}>{tag}</MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
