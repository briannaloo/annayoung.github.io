import java.io.*;
import java.util.*;

public class getISO
{
	public static void main(String[] args) throws IOException 
	{
		String file = "original data/IsoCodes.csv";
		Scanner scan = new Scanner(new File(file));
		System.out.print('{');
		while (scan.hasNextLine())
		{
			String line = scan.nextLine();
			String parts[] = line.split(",");
			System.out.print("\"" + parts[0] + "\"" + ": [" + "\"" + parts[1] + "\"" + ", "
			 + "\"" + parts[2] + "\", \"" + parts[1].toLowerCase() + ".png\"" + "], ");
		}
		System.out.println('}');

	}
}