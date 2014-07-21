import java.io.*;
import java.util.*;

public class getISO
{
	public static void main(String[] args) throws IOException 
	{
		getEPIvalues();
		getImageFiles();
		// getISOcodes();

	}

	public static void getEPIvalues () throws IOException {
		String file = "original data/EPIvalues.csv";
		Scanner scan = new Scanner(new File(file));
		PrintWriter data = new PrintWriter("EPIvalues.json", "UTF-8");
		data.print('{');
		while (scan.hasNextLine())
		{
			String line = scan.nextLine();
			String[] parts = line.split(",");
			data.print("\"" + parts[0] + "\"" + ": {");
			for (int i = 1; i < parts.length; i++)
			{
				String[] split = parts[i].split(";");
				data.print("\"" + split[1] + "\"" + ": " + "\"" + split[0] + "\"" + ", ");
			}
			data.print("},");
		}
		data.print('}');
		data.flush();
		data.close();
	}

	public static void getImageFiles() throws IOException {
		String file = "original data/IsoCodes.csv";
		Scanner scan = new Scanner(new File(file));
		PrintWriter data = new PrintWriter("Images.json", "UTF-8");
		data.print('{');
		while (scan.hasNextLine())
		{
			String line = scan.nextLine();
			String parts[] = line.split(",");
			data.print("\"" + parts[0] + "\"" + ": " + "\"" + parts[3] + "\"" + ", ");
		}
		data.println('}');
		data.flush();
		data.close();
	}

	public static void getISOcodes() throws IOException {
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