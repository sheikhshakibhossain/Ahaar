import React from 'react';
import { Box, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface ImagePreviewProps {
    file: File | null;
    imageUrl?: string;
    onRemove: () => void;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({ file, imageUrl, onRemove }) => {
    const previewUrl = file ? URL.createObjectURL(file) : imageUrl;

    React.useEffect(() => {
        return () => {
            if (file) {
                URL.revokeObjectURL(previewUrl!);
            }
        };
    }, [file]);

    if (!previewUrl) return null;

    return (
        <Box
            sx={{
                position: 'relative',
                width: '100%',
                maxWidth: 300,
                margin: '16px auto',
            }}
        >
            <IconButton
                sx={{
                    position: 'absolute',
                    right: -12,
                    top: -12,
                    backgroundColor: 'background.paper',
                    '&:hover': {
                        backgroundColor: 'action.hover',
                    },
                }}
                size="small"
                onClick={onRemove}
            >
                <CloseIcon />
            </IconButton>
            <img
                src={previewUrl}
                alt="Food preview"
                style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
            />
        </Box>
    );
}; 