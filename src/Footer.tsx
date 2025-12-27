import { Text, Flex, Box, Link, Grid } from "@radix-ui/themes";

const Footer = () => {
    return (
        <Grid asChild justify="center" columns={{ md: "2" }}>
            <footer className="card footer">
                <Text as="div" align="center">
                    <Link href="https://github.com/tukasa0001/DiceStats/blob/main/THIRD_PARTY_LICENSE.md" target="_blank">
                        Third Party License
                    </Link>
                </Text>
                <Text as="div" align="center">
                    <Link href="https://github.com/tukasa0001/DiceStats" target="_blank">
                        Source Code
                    </Link>
                </Text>
            </footer>
        </Grid>
    )
}

export default Footer
