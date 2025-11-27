import React, { useState, useRef } from 'react';
import { 
    Container, 
    Typography, 
    Box, 
    Button,
    Paper,
    Grid
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { json } from '@codemirror/lang-json';
import { oneDark } from '@codemirror/theme-one-dark';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const TextExtractor = () => {
    const [inputText, setInputText] = useState('');
    const [extractedText, setExtractedText] = useState('');
    const [processedHtml, setProcessedHtml] = useState('');
    const extractedTextRef = useRef(null);
    const [copied, setCopied] = useState({ json: false, html: false, translated: false, htmlTranslated: false });
    const [translatedText, setTranslatedText] = useState('');
    const [processedHtmlTranslated, setProcessedHtmlTranslated] = useState('');
    const processedHtmlTranslatedRef = useRef(null);
    const [translatedError, setTranslatedError] = useState('');
    const [isApplyDisabled, setIsApplyDisabled] = useState(false);

    const shouldSkipNode = (node) => {
        // Skip script and style tags
        if (node.nodeName === 'SCRIPT' || node.nodeName === 'STYLE') {
            return true;
        }

        // Skip HTML comments
        if (node.nodeType === Node.COMMENT_NODE) {
            return true;
        }

        // Skip if parent is a tag name or attribute
        const parent = node.parentElement;
        if (parent) {
            // Skip if parent is a tag name (like <!DOCTYPE>, <html>, etc.)
            if (parent.nodeName === node.textContent.trim()) {
                return true;
            }
            // Skip if parent is an attribute
            if (parent.getAttribute && parent.getAttribute(node.textContent.trim())) {
                return true;
            }
        }

        return false;
    };

    const handleExtract = () => {
        try {
            setTranslatedText('');
            setProcessedHtmlTranslated('');
            setTranslatedError('');
            setIsApplyDisabled(false);
            const { processed, extracted } = extractTextNodesRaw(inputText);

            setExtractedText(JSON.stringify(extracted, null, 2));
            setProcessedHtml(processed);

            setTimeout(() => {
                extractedTextRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } catch (error) {
            console.error('Error processing HTML:', error);
            setExtractedText('Error processing HTML');
            setProcessedHtml('Error processing HTML');
        }
    };

    function extractTextNodesRaw(html) {
        // Find all comment ranges
        const commentRanges = [];
        const commentRegex = /<!--[\s\S]*?-->/g;
        let match;
        while ((match = commentRegex.exec(html)) !== null) {
            commentRanges.push([match.index, match.index + match[0].length]);
        }

        // Find all <script>...</script> and <style>...</style> ranges
        const ignoreRanges = [...commentRanges];
        const tagRegex = /<(script|style)[^>]*>[\s\S]*?<\/\1>/gi;
        while ((match = tagRegex.exec(html)) !== null) {
            ignoreRanges.push([match.index, match.index + match[0].length]);
        }

        function isInIgnored(index) {
            return ignoreRanges.some(([start, end]) => index >= start && index < end);
        }

        let index = 0;
        let extracted = {};
        let processed = html;
        
        // Find all text between tags and replace only the text content, preserving spaces
        const textRegex = />([^<]+)</g;
        const matches = [];
        
        // First, collect all matches to process them in reverse order
        while ((match = textRegex.exec(html)) !== null) {
            matches.push({
                fullMatch: match[0],
                text: match[1],
                index: match.index
            });
        }
        
        // Process matches in forward order but use a different approach to avoid index shifting
        // We'll build the result string by processing each match and adjusting positions
        let result = '';
        let lastIndex = 0;
        
        for (let i = 0; i < matches.length; i++) {
            const match = matches[i];
            const startIndex = match.index;
            
            // Add the HTML content before this match
            result += html.substring(lastIndex, startIndex);
            
            if (!isInIgnored(startIndex + 1)) {
                const text = match.text;
                const trimmedText = text.trim();
                
                if (trimmedText) {
                    // Find the start and end of the actual text content (excluding leading/trailing spaces)
                    const textStart = text.indexOf(trimmedText);
                    const textEnd = textStart + trimmedText.length;
                    
                    // Split the text into: spaces before + text content + spaces after
                    const spacesBefore = text.substring(0, textStart);
                    const spacesAfter = text.substring(textEnd);
                    
                    // Create the replacement: spaces before + placeholder + spaces after
                    const replacement = `>${spacesBefore}{{${index}}}${spacesAfter}<`;
                    
                    result += replacement;
                    
                    // Store just the text content (same as before)
                    extracted[index] = trimmedText;
                    index++;
                } else {
                    // Keep the original match if no text content
                    result += match.fullMatch;
                }
            } else {
                // Keep the original match if it's in ignored ranges
                result += match.fullMatch;
            }
            
            lastIndex = startIndex + match.fullMatch.length;
        }
        
        // Add any remaining HTML content after the last match
        result += html.substring(lastIndex);
        processed = result;
        
        return { processed, extracted };
    }

    const handleCopy = (type) => {
        let text;
        if (type === 'json') text = extractedText;
        else if (type === 'html') text = processedHtml;
        else if (type === 'translated') text = translatedText;
        else if (type === 'htmlTranslated') text = processedHtmlTranslated;
        else text = '';

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                setCopied((prev) => ({ ...prev, [type]: true }));
                setTimeout(() => setCopied((prev) => ({ ...prev, [type]: false })), 1200);
            });
        } else {
            // Fallback for insecure context or unsupported browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
                setCopied((prev) => ({ ...prev, [type]: true }));
                setTimeout(() => setCopied((prev) => ({ ...prev, [type]: false })), 1200);
            } catch (err) {
                // Optionally show an error message
            }
            document.body.removeChild(textarea);
        }
    };

    const handleApplyToHtml = () => {
        // Try to parse translatedText as JSON
        let translations;
        try {
            translations = JSON.parse(translatedText);
        } catch (e) {
            // If not valid JSON, just set processedHtmlTranslated to translatedText
            setProcessedHtmlTranslated(translatedText);
            return;
        }
        // Replace placeholders in processedHtml
        let html = processedHtml;
        if (typeof translations === 'object' && translations !== null) {
            Object.entries(translations).forEach(([key, value]) => {
                // Replace all occurrences of {{key}} with value
                const pattern = `{{${key}}}`;
                html = html.split(pattern).join(value);
            });
            setProcessedHtmlTranslated(html);
        } else {
            setProcessedHtmlTranslated(translatedText);
        }
        setTimeout(() => {
            processedHtmlTranslatedRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    // Validate translatedText on change
    const handleTranslatedTextChange = (val) => {
        setTranslatedText(val);
        setTranslatedError('');
        setIsApplyDisabled(false);
        // Only validate if extractedText is valid JSON
        let extractedObj;
        try {
            extractedObj = JSON.parse(extractedText);
        } catch {
            setIsApplyDisabled(true);
            setTranslatedError('Extracted Text (JSON) is not valid JSON.');
            return;
        }
        let translatedObj;
        try {
            translatedObj = JSON.parse(val);
        } catch {
            setIsApplyDisabled(true);
            setTranslatedError('Translated must be valid JSON.');
            return;
        }
        const extractedKeys = Object.keys(extractedObj).sort();
        const translatedKeys = Object.keys(translatedObj).sort();
        if (extractedKeys.length !== translatedKeys.length) {
            setIsApplyDisabled(true);
            setTranslatedError('Translated JSON must have the same number of keys as Extracted Text.');
            return;
        }
        for (let i = 0; i < extractedKeys.length; i++) {
            if (extractedKeys[i] !== translatedKeys[i]) {
                setIsApplyDisabled(true);
                setTranslatedError('Translated JSON keys must match Extracted Text keys.');
                return;
            }
        }
        setIsApplyDisabled(false);
        setTranslatedError('');
    };

    return (
        <Container sx={{ mt: 2, width: "100%" }}>
            <Typography variant="h4" gutterBottom>
                Text Extractor
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper sx={{ p: 3 }}>
                        <Box sx={{ 
                            height: '400px',
                            border: '1px solid rgba(255, 255, 255, 0.23)',
                            borderRadius: '4px',
                            overflow: 'hidden',
                        }}>
                            <CodeMirror
                                value={inputText}
                                onChange={setInputText}
                                height="400px"
                                theme={oneDark}
                                extensions={[html()]}
                                basicSetup={{
                                    lineNumbers: true,
                                    highlightActiveLineGutter: true,
                                    highlightSpecialChars: true,
                                    foldGutter: true,
                                    drawSelection: true,
                                    dropCursor: true,
                                    allowMultipleSelections: true,
                                    indentOnInput: true,
                                    syntaxHighlighting: true,
                                    bracketMatching: true,
                                    closeBrackets: true,
                                    autocompletion: true,
                                    rectangularSelection: true,
                                    crosshairCursor: true,
                                    highlightActiveLine: true,
                                    highlightSelectionMatches: true,
                                    closeBracketsKeymap: true,
                                    searchKeymap: true,
                                    foldKeymap: true,
                                    completionKeymap: true,
                                    lintKeymap: true,
                                }}
                            />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleExtract}
                                startIcon={<PlayArrowIcon />}
                                size="large"
                            >
                                Extract
                            </Button>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12}>
                    <Accordion defaultExpanded={false} sx={{ boxShadow: 'none', background: 'transparent' }}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel-html-placeholders-content"
                            id="panel-html-placeholders-header"
                            sx={{
                                p: 0, m: 0,
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: '6px',
                                backgroundColor: 'rgba(0,0,0,0.04)',
                                minHeight: '56px',
                                '&.Mui-expanded': { minHeight: '56px' },
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', px: 2, py: 1 }}>
                                <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
                                    Processed HTML (with placeholders)
                                </Typography>
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails sx={{ p: 0, pt: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                                <Tooltip title={copied.html ? 'Copied!' : 'Copy'}>
                                    <IconButton onClick={() => handleCopy('html')}>
                                        <ContentCopyIcon />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                            <Box sx={{ 
                                height: '400px',
                                border: '1px solid rgba(255, 255, 255, 0.23)',
                                borderRadius: '4px',
                                overflow: 'hidden',
                            }}>
                                <CodeMirror
                                    value={processedHtml}
                                    height="400px"
                                    theme={oneDark}
                                    extensions={[html()]}
                                    editable={false}
                                    basicSetup={{
                                        lineNumbers: true,
                                        highlightActiveLineGutter: true,
                                        highlightSpecialChars: true,
                                        foldGutter: true,
                                        drawSelection: true,
                                        dropCursor: true,
                                        allowMultipleSelections: true,
                                        indentOnInput: true,
                                        syntaxHighlighting: true,
                                        bracketMatching: true,
                                        closeBrackets: true,
                                        autocompletion: true,
                                        rectangularSelection: true,
                                        crosshairCursor: true,
                                        highlightActiveLine: true,
                                        highlightSelectionMatches: true,
                                        closeBracketsKeymap: true,
                                        searchKeymap: true,
                                        foldKeymap: true,
                                        completionKeymap: true,
                                        lintKeymap: true,
                                    }}
                                />
                            </Box>
                        </AccordionDetails>
                    </Accordion>
                </Grid>
                <Grid item xs={12} md={6} ref={extractedTextRef}>
                    <Paper sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="h6" gutterBottom>
                                Extracted Text (JSON)
                            </Typography>
                            <Tooltip title={copied.json ? 'Copied!' : 'Copy'}>
                                <IconButton onClick={() => handleCopy('json')}>
                                    <ContentCopyIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                        <Box sx={{ 
                            height: '400px',
                            border: '1px solid rgba(255, 255, 255, 0.23)',
                            borderRadius: '4px',
                            overflow: 'hidden',
                        }}>
                            <CodeMirror
                                value={extractedText}
                                height="400px"
                                theme={oneDark}
                                extensions={[json()]}
                                editable={false}
                                basicSetup={{
                                    lineNumbers: true,
                                    highlightActiveLineGutter: true,
                                    highlightSpecialChars: true,
                                    foldGutter: true,
                                    drawSelection: true,
                                    dropCursor: true,
                                    allowMultipleSelections: true,
                                    indentOnInput: true,
                                    syntaxHighlighting: true,
                                    bracketMatching: true,
                                    closeBrackets: true,
                                    autocompletion: true,
                                    rectangularSelection: true,
                                    crosshairCursor: true,
                                    highlightActiveLine: true,
                                    highlightSelectionMatches: true,
                                    closeBracketsKeymap: true,
                                    searchKeymap: true,
                                    foldKeymap: true,
                                    completionKeymap: true,
                                    lintKeymap: true,
                                }}
                            />
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="h6" gutterBottom>
                                Translated
                            </Typography>
                            <Tooltip title={copied.translated ? 'Copied!' : 'Copy'}>
                                <IconButton onClick={() => handleCopy('translated')}>
                                    <ContentCopyIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                        <Box sx={{ 
                            height: '400px',
                            border: '1px solid rgba(255, 255, 255, 0.23)',
                            borderRadius: '4px',
                            overflow: 'hidden',
                        }}>
                            <CodeMirror
                                value={translatedText}
                                height="400px"
                                theme={oneDark}
                                extensions={[json()]}
                                editable={true}
                                onChange={handleTranslatedTextChange}
                                basicSetup={{
                                    lineNumbers: true,
                                    highlightActiveLineGutter: true,
                                    highlightSpecialChars: true,
                                    foldGutter: true,
                                    drawSelection: true,
                                    dropCursor: true,
                                    allowMultipleSelections: true,
                                    indentOnInput: true,
                                    syntaxHighlighting: true,
                                    bracketMatching: true,
                                    closeBrackets: true,
                                    autocompletion: true,
                                    rectangularSelection: true,
                                    crosshairCursor: true,
                                    highlightActiveLine: true,
                                    highlightSelectionMatches: true,
                                    closeBracketsKeymap: true,
                                    searchKeymap: true,
                                    foldKeymap: true,
                                    completionKeymap: true,
                                    lintKeymap: true,
                                }}
                            />
                        </Box>
                        {translatedError && (
                            <Box sx={{ color: 'error.main', mt: 1, mb: 1 }}>
                                {translatedError}
                            </Box>
                        )}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleApplyToHtml}
                                startIcon={<AssignmentTurnedInIcon />}
                                size="large"
                                disabled={isApplyDisabled}
                            >
                                Apply to HTML
                            </Button>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} ref={processedHtmlTranslatedRef}>
                    <Paper sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="h6" gutterBottom>
                                Processed HTML (with translated text)
                            </Typography>
                            <Tooltip title={copied.htmlTranslated ? 'Copied!' : 'Copy'}>
                                <IconButton onClick={() => handleCopy('htmlTranslated')}>
                                    <ContentCopyIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                        <Box sx={{ 
                            height: '400px',
                            border: '1px solid rgba(255, 255, 255, 0.23)',
                            borderRadius: '4px',
                            overflow: 'hidden',
                        }}>
                            <CodeMirror
                                value={processedHtmlTranslated}
                                height="400px"
                                theme={oneDark}
                                extensions={[html()]}
                                editable={false}
                                basicSetup={{
                                    lineNumbers: true,
                                    highlightActiveLineGutter: true,
                                    highlightSpecialChars: true,
                                    foldGutter: true,
                                    drawSelection: true,
                                    dropCursor: true,
                                    allowMultipleSelections: true,
                                    indentOnInput: true,
                                    syntaxHighlighting: true,
                                    bracketMatching: true,
                                    closeBrackets: true,
                                    autocompletion: true,
                                    rectangularSelection: true,
                                    crosshairCursor: true,
                                    highlightActiveLine: true,
                                    highlightSelectionMatches: true,
                                    closeBracketsKeymap: true,
                                    searchKeymap: true,
                                    foldKeymap: true,
                                    completionKeymap: true,
                                    lintKeymap: true,
                                }}
                            />
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default TextExtractor; 